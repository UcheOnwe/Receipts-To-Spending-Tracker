namespace API.Controllers;
using DotNetEnv;
//from receipt api
using API.Data;
using API.Models;

using Microsoft.AspNetCore.Mvc;
using API.Services;
using API.Dtos;
using SQLitePCL;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    
   /*  private readonly AiService _service;

    //for ai response test
    
    public AiController()
    {
        _service = new AiService();
    } */
    private readonly AiService _ai;
     public AiController(AiService ai)
    {
        _ai = ai;
    }
    [HttpGet("openai-test")]
    public async Task<IActionResult> OpenAiTest()
    {
        try
        {
            var result = await _ai.GetAiResponseAsync("Say :'OpenAI test successful.'");
            return Ok(new{ response = result });
        }
        catch(Exception ex)
        {
            return StatusCode(500, new {error = ex.Message});
        }
    }

 //for ai prompt test
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] PromptRequest request)
    {
        try
        {
            var result = await _ai.GetAiResponseAsync(request.Prompt);
            return Ok( new{ response = result});
        }
        catch(Exception ex)
        {
            return StatusCode(500, new {error = ex.Message});
        }
    }

    public class PromptRequest
    {
        public required string Prompt {get;set;}
    }

    //for backend connection test
    [HttpGet("test")]
    public string Test()
    {
        return _ai.Test();
    }

   /*  //receive and upload photo to AI
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromServices] AiService ai)
    {
        if(file ==null || file.Length ==0)
            return BadRequest("No file uploaded");
        var result = await ai.ProcessImageAsync(file);
        return Ok(new {response = result });
    } */

    //save image to pass as url
     
    /*[HttpPost("image")]
    public async Task<IActionResult> ProcessImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        // Save file to wwwroot/uploads
        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploads);

        var fileName = Guid.NewGuid() + ".jpg";
        var filePath = Path.Combine(uploads, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Build a public URL for OpenAI
        //var imageUrl = $" {Request.Scheme}://{Request.Host}/uploads/{fileName}"; //Build URL based on who called this API
        

        //Get BASE URL (supports teammate + you)
        string baseUrl = Environment.GetEnvironmentVariable("API_URL")
        ?? Env.GetString("API_URL")
        ?? Env.GetString("GROK_API");

        //Build image URL with fallback
        string imageUrl;

        if (!string.IsNullOrEmpty(baseUrl))
        {
            imageUrl = $"{baseUrl}/uploads/{fileName}";
        }
        else
        {
            imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        }

        Console.WriteLine("Final Image URL: " + imageUrl);
        
        
           // whenever start new session in command prompt: ngrok http *portnumber* for me 5000
        

        //create receipt object
        CreateReceiptDto Rec = new CreateReceiptDto();
        try{
            //put in store data
            Rec.Store = await _ai.NameProcessImageUrlAsync(imageUrl); 
        }
        catch (Exception ex)
        {
            Console.WriteLine("AI ERROR: " + ex.Message);
            Rec.Store = "NO NAME FOUND";
        }
        //await _ai.NameProcessImageUrlAsync(imageUrl);
        return Ok(Rec);
        //await _ai.NameProcessImageUrlAsync(imageUrl); (Commented for now because it crashes everything that has to do with receiving image)

        //create product list
        //get list of items with quantity and price from AI
        //var listOfItems = await _ai.ProductProcessImageUrlAsync(imageUrl);
        //Console.Write("****" + listOfItems); //writes in backend command prompt
        //go through list of items and make a new item for the receipt
        //Rec.Items = AiService.MakeList(listOfItems);
        //crete Receipt
       // var reslult = await api.CreateReceiptAsync(Rec);

        // Call AiService
        //var result = await _ai.ProcessImageUrlAsync(imageUrl);

        //this will take the response and populate the item list for the receipt


        /*make three functions each for part of the receipt
        var storeNAme = await _ai.NameProcessImageUrlAsync(imageUrl);
        var total =  await _ai.TotalProcessImageUrlAsync(imageUrl);
        var List<string> products = await _ai.ProductProcessImageUrlAsync(image);

        Do not need to create object need to impout data into reciept objects
        need to look up how to import other functions from other C# files
        
        

        //return Ok(new { response = result });
    }*/

    //trying endpoint with base64
    [HttpPost("imageName")]
    public async Task<IActionResult> ProcessImageName([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        try
        {
            // ============================================
            // STEP 1: Read image file into memory
            // WHY: We need the raw bytes to convert to base64
            // ============================================
            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            // ============================================
            // STEP 2: Convert bytes to base64 string
            // WHY: OpenAI accepts base64 encoded images
            // NO PUBLIC URL NEEDED!
            // ============================================
            string base64Image = Convert.ToBase64String(imageBytes);
            Console.WriteLine($"NEW REQUEST --- {DateTime.Now}");
            Console.WriteLine($"Base64 preview: {base64Image.Substring(0, 50)}");

            Console.WriteLine("Image converted to base64");
            Console.WriteLine($"Base64 length: {base64Image.Length} characters");

            // ============================================
            // STEP 3: Create receipt object
            // ============================================
            CreateReceiptDto Rec = new CreateReceiptDto();
            Console.WriteLine("Created receipt object");

            // ============================================
            // STEP 4: Send base64 to OpenAI to get store name
            // WHY: Using new base64 method instead of URL method
            // ============================================
            Rec.Store = await _ai.NameProcessImageBase64Async(base64Image);
            Console.WriteLine("Store name extracted: " + Rec.Store);

            // ============================================
            // STEP 5: Get list of items from OpenAI
            // WHY: Using base64 method - consistent approach
            // ============================================
            Console.WriteLine("Extracting items...");
            var listOfItems = await _ai.ProductProcessImageBase64Async(base64Image);
            Console.WriteLine("NEW ITEMS RESPONSE RECEIVED");

            // ============================================
            // STEP 6: Parse items into receipt
            // ============================================
            Console.WriteLine("Parsing items...");
            Rec.Items = AiService.MakeList(listOfItems);
            Console.WriteLine($"Parsed {Rec.Items.Count} items");

            // ============================================
            // STEP 7: Return receipt object to frontend
            // ============================================
            return Ok(Rec);
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR: " + ex.Message);
            Console.WriteLine("Stack trace: " + ex.StackTrace);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /*[HttpPost("imageName")]
    public async Task<IActionResult> ProcessImageName(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        // Save file to wwwroot/uploads
        var uploads = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploads);

        var fileName = Guid.NewGuid() + ".jpg";
        var filePath = Path.Combine(uploads, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        //get ngrok address
        string grok = Env.GetString("GROK_API");
        // Build a public URL for OpenAI
       
        Console.WriteLine("grock address:" + grok);
        //var imageUrl = $"https://{Request.Host}/uploads/{fileName}"; //Changed to whatever URL is hitting the backend rather than
        var imageUrl =$"{grok}/uploads/{fileName}";
        Console.WriteLine("Final Image URL: " + imageUrl);
       
        //Being Hardcoded and messing up when URL changes 
        //^^^ since using free version of ngrok may need to update each time^^^
        
            //whenever start new session in command prompt: ngrok http *portnumber* for me 5000
        

        //create receipt object
        CreateReceiptDto Rec = new CreateReceiptDto();
        Console.WriteLine("created receipt object");
        Console.WriteLine("image url: " +imageUrl);
        //put in store data
        Rec.Store = await _ai.NameProcessImageUrlAsync(imageUrl);
         Console.WriteLine("name has been processed");                          ///
        //get list of items
        Console.WriteLine("make list of items");
        var listOfItems = await _ai.ProductProcessImageUrlAsync(imageUrl);
        Console.WriteLine("polulating items");
        Rec.Items = AiService.MakeList(listOfItems);
        Console.WriteLine("return receipt");
        return Ok(Rec);
       
    }*/
}
namespace API.Controllers;

//from receipt api
using API.Data;
using API.Models;

using Microsoft.AspNetCore.Mvc;
using API.Services;
using API.Dtos;

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
     
    [HttpPost("image")]
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
        var imageUrl = $" https://unquellable-undeviously-idell.ngrok-free.dev/uploads/{fileName}";
        //^^^ since using free version of ngrok may need to update each time^^^
        /*
            whenever start new session in command prompt: ngrok http *portnumber* for me 5000
        */

        //create receipt object
        CreateReceiptDto Rec = new CreateReceiptDto();
        //put in store data
        Rec.Store = await _ai.NameProcessImageUrlAsync(imageUrl);

        //create product list
        //get list of items with quantity and price from AI
        var listOfItems = await _ai.ProductProcessImageUrlAsync(imageUrl);
        Console.Write("****" + listOfItems); //writes in backend command prompt
        //go through list of items and make a new item for the receipt
        Rec.Items = AiService.MakeList(listOfItems);
        //crete Receipt
       // var reslult = await api.CreateReceiptAsync(Rec);

        // Call AiService
        var result = await _ai.ProcessImageUrlAsync(imageUrl);

        //this will take the response and populate the item list for the receipt


        /*make three functions each for part of the receipt
        var storeNAme = await _ai.NameProcessImageUrlAsync(imageUrl);
        var total =  await _ai.TotalProcessImageUrlAsync(imageUrl);
        var List<string> products = await _ai.ProductProcessImageUrlAsync(image);

        Do not need to create object need to impout data into reciept objects
        need to look up how to import other functions from other C# files
        
        */

        return Ok(new { response = result });
    }

    [HttpPost("imageName")]
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

        // Build a public URL for OpenAI
        var imageUrl = $" https://unquellable-undeviously-idell.ngrok-free.dev/uploads/{fileName}";
        //^^^ since using free version of ngrok may need to update each time^^^
        /*
            whenever start new session in command prompt: ngrok http *portnumber* for me 5000
        */

        //create receipt object
        CreateReceiptDto Rec = new CreateReceiptDto();
        Console.WriteLine("created receipt object");
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
       
    }
}
using System;
using API.Dtos;
using API.Services;
using Microsoft.AspNetCore.Mvc; //Importing controller features 

namespace API.Controllers;

[ApiController] //for automatic validation
[Route("api/[controller]")] //Asp.Net removes controller from class name for URL purpose. 
                            // Example: /api/receipt
public class ReceiptController : ControllerBase // Inheriting from controllerBase with built in methods such as ok(), NotFound(), BadRequest()
{
    private readonly ReceiptService _receiptService;

    public ReceiptController(ReceiptService receiptService)
    {
        _receiptService = receiptService; //Dependency Injection
    }


    //Get all receipts for user 1
    [HttpGet]
    public async Task<IActionResult> GetAll() //IAction is a flexible return type for controllers
                                            //Can return ok(200), NotFound (404), BadRequest (400), etc. 
    {
        var receipts = await _receiptService.GetAllReceiptAsync(); //when using the type var, for this case  c# is actually calling 
                                                                  // type List<ReceiptResponseDto>
                                                                  //await in this case is waiting for service to finish
        return Ok(receipts); //success response to mobile app and sending receipts details
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var receipt = await _receiptService.GetReceiptByIdAsync(id);

        //Check if we have the id in the database if not we return a message not found
        if(receipt == null)
        {
            return NotFound(new { message = "Receipt not found"}); //anonymous object
        }

        return Ok(receipt);
    }

    //Creating Data
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReceiptDto dto) //POST request send data in the body thats why(not in URL)
                                                                            //we use [FromBody]
    {
        var receipt = await _receiptService.CreateReceiptAsync(dto);
        return Ok(receipt);
    }

    //Deleting Data
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _receiptService.DeleteReceiptAsync(id);
        if (!success)
        {
            return NotFound(new { message = "Receipt not found" });
        }
        return Ok(new { message = "Receipt deleted successfully" });
    }

    // TEMPORARY - Just for testing
    [HttpPost("setup-test-user")]
    public async Task<IActionResult> SetupTestUser()
    {
        var wasCreated = await _receiptService.CreateTestUserIfNeededAsync();
        
        if (wasCreated)
        {
            return Ok(new { message = "Test user created with UserId = 1" });
        }
        else
        {
            return Ok(new { message = "Test user already exists" });
        }
    }
}

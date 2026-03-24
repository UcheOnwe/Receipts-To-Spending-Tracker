namespace API.Controllers;

using Microsoft.AspNetCore.Mvc;
using API.Services;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly AiService _service = new();

    [HttpGet("test")]
    public string Test()
    {
        return _service.Test();
    }
}
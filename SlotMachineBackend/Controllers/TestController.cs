using Microsoft.AspNetCore.Mvc;

namespace SlotMachineBackend.Controllers
{
    [ApiController]
    [Route("[controller]")] // maps to /test
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Hello()
        {
            return Ok("Backend is working!");
        }
    }
}

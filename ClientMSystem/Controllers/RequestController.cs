using Microsoft.AspNetCore.Mvc;

namespace ClientMSystem.Controllers
{
    public class RequestController : BaseController
    {
        private readonly ILogger _logger;

        public RequestController(ILogger<RequestController> logger)
        {
            _logger = logger;   
        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Send()
        {
            try
            {
                Notify("Request send Successfully!");
            }
            catch (Exception)
            {

            }
            return RedirectToAction(nameof(Index));
        }
    }
}

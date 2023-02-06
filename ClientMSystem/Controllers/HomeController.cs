using ClientMSystem.Data;
using ClientMSystem.Migrations;
using ClientMSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;

namespace ClientMSystem.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        public HomeController(ILogger<HomeController> logger , ApplicationContext context)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
           return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }


        //[HttpPost]
        //public ActionResult Pause(int id)
        //{
        //    //Check if the current user is an admin
        //    if (Roles = "User"))
        //    {
        //        //Pause the program by setting a flag
        //        isPaused = true;
        //    }
        //    else
        //    {
                
        //    }
        //    return RedirectToAction("Index");
        //}
    


    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
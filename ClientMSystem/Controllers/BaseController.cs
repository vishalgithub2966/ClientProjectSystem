using ClientMSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Drawing;

namespace ClientMSystem.Controllers
{
    public class BaseController : Controller
    {
        public void Notify(string message, string title = "Sweet Alert Toastr Demo",
                         NotificationType notificationType = NotificationType.success)
        {
            var msg = new
            {
                message = message,
                title = title,
                icon = notificationType.ToString(),
                type = notificationType.ToString(),
                provider = GetProvider()
            };
            TempData["Message"] = JsonConvert.SerializeObject(msg);
        }
        private string GetProvider()
        {
            var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables();
            IConfigurationRoot configuration = builder.Build();
            var value = configuration["NotificationProvider"];
            return value;
        }
    }
}

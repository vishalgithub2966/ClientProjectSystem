using ClientMSystem.Controllers;
using ClientMSystem.Data;
using ClientMSystem.Migrations;
using ClientMSystem.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using NLog.Fluent;
using System.Security.Claims;
using System.Security.Principal;

namespace ClientMSystem.Controllers
{



    //Admin Controller

    public class AdminController : Controller
    {
        private readonly ApplicationContext context;

        public AdminController(ApplicationContext context)
        {
            this.context = context;
        }

        public IActionResult AdminLogin()
        {
            return View();
        }


        [HttpPost]
        public IActionResult AdminLogin(AdminModel model)
        {
            if (ModelState.IsValid)
            {
                var adData = context.adminModel.FirstOrDefault(a => a.Username == model.Username && a.Password == model.Password);
                if (adData != null)
                {
                    var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, model.Username) },
                         CookieAuthenticationDefaults.AuthenticationScheme);

                    var principal = new ClaimsPrincipal(identity);
                    HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
                    HttpContext.Session.SetInt32("UserId", adData.Id);  // store imp info in session


                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    ViewBag.msg = "<div class='alert alert-danger alert-dismissible fade show' role='alert'> Invalid Email Or Password!! <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\r\n    <span aria-hidden=\"true\">&times;</span>\r\n  </button>\r\n</div>";
                    return View(model);
                }
            }
            return View();
        }

        public IActionResult LogOut()
        {

            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var StoredCookies = Request.Cookies.Keys; // After Logout Delete the all cookies.
            foreach (var cookie in StoredCookies)
            {
                Response.Cookies.Delete(cookie);
            }
            return RedirectToAction("Login", "Account");
        }

        //Forget Password:

        public IActionResult ForgetPassword()
        {
            return View();
        }




    }
    }
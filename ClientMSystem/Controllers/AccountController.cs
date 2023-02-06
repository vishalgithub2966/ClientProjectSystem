using ClientMSystem.Controllers;
using ClientMSystem.Data;
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

    public class AccountController : Controller
    {
        private static readonly NLog.Logger Logger = NLog.LogManager.GetCurrentClassLogger();

        private readonly ApplicationContext context;

        public AccountController(ApplicationContext context)
        {
            this.context = context;
        }
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login(SignUp model)
        {
            // var userId = HttpContext.Session.GetInt32("UserId");
            try
            {
                Logger.Info("Login Method was called.");
                var data = context.signUps.FirstOrDefault(e => e.Username == model.Username);

                if (data != null)
                {
                    bool isValid = (data.Username == model.Username && data.Password == model.Password);
                    if (isValid)
                    {
                        var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, model.Username) },
                        CookieAuthenticationDefaults.AuthenticationScheme);

                        Logger.Info($"user name : {identity.Name}");

                        var principal = new ClaimsPrincipal(identity);
                        HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
                        HttpContext.Session.SetInt32("UserId", data.ID); // store imp info in session

                        return RedirectToAction("Index", "Home");
                    }
                    else
                    {
                        ViewBag.msg = "<div class='alert alert-danger alert-dismissible fade show' role='alert'> Invalid Email Or Password!! <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\r\n    <span aria-hidden=\"true\">&times;</span>\r\n  </button>\r\n</div>";
                        TempData["Errormessage"] = "Check Credentials";
                        return View(model);

                    }
                }
                else
                {
                    TempData["Errormessage"] = "UserName Not found";
                    return View(model);
                    Logger.Warn("An error occurred in Login");
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public IActionResult LogOut()
        {
            
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var StoredCookies = Request.Cookies.Keys; // After Logout Delete the all cookies.
            foreach(var cookie in StoredCookies)
            {
                Response.Cookies.Delete(cookie);
            }
            return RedirectToAction("Login", "Account");
        }
        [AcceptVerbs("Post", "Get")]
        public IActionResult UserNameIsExits(string Uname)
        {
            try
            {
                var data = context.signUps.Where(e => e.Username == Uname).SingleOrDefault();
                if (data != null)
                {
                    return Json($"userName {Uname} already Exits");

                }
                else
                {
                    return Json(true);
                }
            }catch(Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult SignUp()
        {
            return View();
        }
        [HttpPost]
        public IActionResult SignUp(SignUp model)
        {
            try
            {
                Logger.Info("Signup Method was called.");
                if (ModelState.IsValid)
                {
                    var data = new SignUp
                    {
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        Username = model.Username,
                        Email = model.Email,
                        Mobile = model.Mobile,
                        Password = model.Password,
                        ConformPassword = model.ConformPassword
                    };

                    Logger.Info($"FirstName : {data.FirstName}, LastName : {data.LastName}, UserName : {data.Username}, Email: {data.Email}, Mobile : {data.Mobile}, Password : {data.Password} ");
                    context.signUps.Add(data);
                    context.SaveChanges();
                    TempData["SuccessMessage"] = "User Registration Successfully!! Please Login!";
                    return RedirectToAction("Login");
                }
                else
                {
                    Logger.Error("Fill all Fields");
                    TempData["errorMessage"] = "Fill The All Fileds";
                    return View(model);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
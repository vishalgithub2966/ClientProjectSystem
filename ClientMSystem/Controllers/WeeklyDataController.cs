using ClientMSystem.Data;
using ClientMSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace ClientMSystem.Controllers
{
    public class WeeklyDataController : Controller
    {
        private readonly ILogger<TaskSheetController> _logger;

        private readonly ApplicationContext context;
        public WeeklyDataController(ApplicationContext context)
        {
            this.context = context;
            
        }
        public IActionResult Index()
        {

            
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
            {
                return View();
            }
            else
            {
                var result = context.weekDatas.ToList(); // to show thw details on view
                return View(result);
            }
        }

        //Create
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create([Bind("Id,Day,Date,Task,UserName,Hours")] WeekData model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            try
            {
               
                if (ModelState.IsValid && userId.HasValue)
                {
                    var res = new WeekData()
                    {
                        Date = model.Date,
                        Task = model.Task,
                        Day = model.Day,
                        Hours = model.Hours,
                        UserName= model.UserName,
                        
                    };

                                          

                    context.weekDatas.Add(res);
                    context.SaveChanges();
                    TempData["error"] = "Sheet Updated Successfully";
                    return RedirectToAction("Index");
                }
                else
                {
                    //Logger.Error("Enter All Details");
                    TempData["Error"] = "Enter All Details";
                    return View(model);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public IActionResult Delete(int id)
        {
            try
            {
                
                var rec = context.weekDatas.SingleOrDefault(e => e.Id == id);
                context.weekDatas.Remove(rec);
                context.SaveChanges();
                TempData["Error"] = " Delete Record Successfully";
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IActionResult Edit(int id)
        {
            var model = context.weekDatas.SingleOrDefault(e => e.Id == id);
            var result = new WeekData()
            {

                Date = model.Date,
                Task = model.Task,
                Day = model.Day,
                Hours = model.Hours,

            };
            return View(result);
        }
        [HttpPost]
        public IActionResult Edit(WeekData model)
        {
            try
            {
               
                var rec = new WeekData()
                {
                    Id = model.Id,
                    Date = model.Date,
                    Task = model.Task,
                    Day = model.Day,
                    Hours = model.Hours,

                };

                                    


                context.weekDatas.Update(rec);
                context.SaveChanges();
                TempData["Error"] = "Sheet Updated Successfully";
                return RedirectToAction("Index");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

    }
}

using ClientMSystem.Data;
using Microsoft.AspNetCore.Mvc;
using ClientMSystem.Models;
using IronPdf;
using Stubble.Core.Builders;

namespace ClientMSystem.Controllers
{
    public class TaskSheetController : Controller
    {
        //private static readonly NLog.Logger Logger = NLog.LogManager.GetCurrentClassLogger();

        private readonly ILogger<TaskSheetController> _logger;

        private readonly ApplicationContext context;
        public TaskSheetController(ApplicationContext context, ILogger<TaskSheetController> logger)
        {
            this.context = context;
            _logger = logger;
        }
        public IActionResult Index()
        {

            _logger.LogInformation("TaskSheet page accessed");
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
            {
                return View();
            }
            else
            {
                var result = context.timeSheets.ToList(); // to show thw details on view
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
        public IActionResult Create(TimeSheet model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            try
            {
                _logger.LogInformation("Create TaskSheet Method was Called");
                if (ModelState.IsValid && userId.HasValue)
                {
                    var res = new TimeSheet()
                    {
                        Date = model.Date,
                        Module = model.Module,
                        ExpectedTaskToCompleted = model.ExpectedTaskToCompleted,
                        ExpectedHours = model.ExpectedHours,
                        CompletedTasks = model.CompletedTasks,
                        UnPlannedTask = model.UnPlannedTask,
                        ActualHours = model.ActualHours,
                        CommentsForAnyDealy = model.CommentsForAnyDealy,
                        QuestionsActionsToBeAsked = model.QuestionsActionsToBeAsked,
                    };

                    _logger.LogInformation($"Date : {res.Date}, Module : {res.Module}, ExpecTedTaskTComplete : {res.ExpectedTaskToCompleted}, Expected Hr. : {res.ExpectedHours}," +
                        $" CompletedTasks : {res.CompletedTasks}, UnplanedTask : {res.UnPlannedTask}, ActualHour : {res.ActualHours}," +
                        $" CommentsForAnyDelay : {res.CommentsForAnyDealy}, QuestionsActionsToBeAsked : {res.QuestionsActionsToBeAsked}");

                    context.timeSheets.Add(res);
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
                _logger.LogInformation("Delete Method was called.");
                var rec = context.timeSheets.SingleOrDefault(e => e.Id == id);
                context.timeSheets.Remove(rec);
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
            var model = context.timeSheets.SingleOrDefault(e => e.Id == id);
            var result = new TimeSheet()
            {

                Date = model.Date,
                Module = model.Module,
                ExpectedTaskToCompleted = model.ExpectedTaskToCompleted,
                ExpectedHours = model.ExpectedHours,
                CompletedTasks = model.CompletedTasks,
                UnPlannedTask = model.UnPlannedTask,
                ActualHours = model.ActualHours,
                CommentsForAnyDealy = model.CommentsForAnyDealy,
                QuestionsActionsToBeAsked = model.QuestionsActionsToBeAsked,

            };
            return View(result);
        }
        [HttpPost]
        public IActionResult Edit(TimeSheet model)
        {
            try
            {
                _logger.LogInformation("Edit Method was called.");
                var rec = new TimeSheet()
                {
                    Id = model.Id,
                    Date = model.Date,
                    Module = model.Module,
                    ExpectedTaskToCompleted = model.ExpectedTaskToCompleted,
                    ExpectedHours = model.ExpectedHours,
                    CompletedTasks = model.CompletedTasks,
                    UnPlannedTask = model.UnPlannedTask,
                    ActualHours = model.ActualHours,
                    CommentsForAnyDealy = model.CommentsForAnyDealy,
                    QuestionsActionsToBeAsked = model.QuestionsActionsToBeAsked,

                };

                _logger.LogInformation($"Id : {rec.Id}, Date : {rec.Date}, Module : {rec.Module}, ExpectedTaskToCompleted : {rec.ExpectedTaskToCompleted}," +
                    $"ExpectedHours : {rec.ExpectedHours}, CompletedTasks : {rec.CompletedTasks}, UnPlannedTask : {rec.UnPlannedTask}," +
                    $"ActualHours : {rec.ActualHours}, CommentsForAnyDealy : {rec.CommentsForAnyDealy}, QuestionsActionsToBeAsked:{rec.QuestionsActionsToBeAsked}");

                context.timeSheets.Update(rec);
                context.SaveChanges();
                TempData["Error"] = "Sheet Updated Successfully";
                return RedirectToAction("Index");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        //For Create PDF File
        public IActionResult Createpdf(int id)
        {
            try
            {
                _logger.LogInformation("Create PDF Method was called.");
                var model = context.timeSheets.SingleOrDefault(e => e.Id == id);
                var result = new TimeSheet()
                {
                    Date = model.Date,
                    Module = model.Module,
                    ExpectedTaskToCompleted = model.ExpectedTaskToCompleted,
                    ExpectedHours = model.ExpectedHours,
                    CompletedTasks = model.CompletedTasks,
                    UnPlannedTask = model.UnPlannedTask,
                    ActualHours = model.ActualHours,
                    CommentsForAnyDealy = model.CommentsForAnyDealy,
                    QuestionsActionsToBeAsked = model.QuestionsActionsToBeAsked,
                };

                _logger.LogInformation($"Date : {result.Date}, Module : {result.Module}, ExpectedTaskCompleted : {result.ExpectedTaskToCompleted}," +
                    $"ExpectedHours : {result.ExpectedHours}, CompletedTask : {result.CompletedTasks}," +
                    $"UnPlannedTask : {result.UnPlannedTask}, ActualHours : {result.ActualHours}, CommentsForAnyDealy : {result.CommentsForAnyDealy}," +
                    $"QuestionsActionsToBeAsked : {result.QuestionsActionsToBeAsked}");

                context.timeSheets.Add(result);

                var htmlTemplate = System.IO.File.ReadAllText("CreatePDF.html");
                var builder = new StubbleBuilder();
                var boundTemplate = builder.Build().Render(htmlTemplate, model);

                var htmlToPdf = new IronPdf.ChromePdfRenderer();
                var pdfFile = htmlToPdf.RenderHtmlAsPdf(boundTemplate);
                var pdfFileName = "pdfFile.pdf";
                pdfFile.SaveAs(pdfFileName);
                TempData["Error"] = "Create PDF Successfully";
                return RedirectToAction("Index");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
}

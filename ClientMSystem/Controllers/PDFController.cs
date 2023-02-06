using ClientMSystem.Data;
using ClientMSystem.Models;
using IronPdf;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Pkcs;
using Stubble.Core.Builders;
using Stubble.Core.Contexts;

namespace ClientMSystem.Controllers
{
    public class PDFController : Controller
    {
        private readonly ApplicationContext context;

        public PDFController(ApplicationContext context)
        {
            this.context = context;
        }
        //public IActionResult Index(TimeSheet model)
        //{
        //    var htmlTemplate = System.IO.File.ReadAllText("CreatePDF.html");
        //    var builder = new StubbleBuilder();
        //    model.Id = 10;
        //    model.Date = DateTime.Now.ToShortDateString();
        //    //model.CompletedTasks = 8;
        //    var boundTemplate = builder.Build().Render(htmlTemplate, model);

        //    var htmlToPdf = new IronPdf.ChromePdfRenderer();
        //    var pdfFile = htmlToPdf.RenderHtmlAsPdf(boundTemplate);
        //    var pdfFileName = "pdfFile.pdf";
        //    pdfFile.SaveAs(pdfFileName);

        //    return View();
        //    //var html = System.IO.File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "C:\\Users\\prajakta.chavan\\Downloads\\ClientMSystem\\ClientMSystem\\Views\\TaskSheet\\Create.cshtml"));
        //    //var ChromePdfRenderer = new ChromePdfRenderer();
        //    //using var pdf = ChromePdfRenderer.RenderHtmlAsPdf(html);
        //    //pdf.SaveAs(Path.Combine(Directory.GetCurrentDirectory(), "Record.Pdf"));

        //    //return View();
        //}
        public IActionResult Createpdf(int id)
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
            context.timeSheets.Add(result);

            var htmlTemplate = System.IO.File.ReadAllText("CreatePDF.html");
            var builder = new StubbleBuilder();
            var boundTemplate = builder.Build().Render(htmlTemplate, model);

            var htmlToPdf = new IronPdf.ChromePdfRenderer();
            var pdfFile = htmlToPdf.RenderHtmlAsPdf(boundTemplate);
            var pdfFileName = "pdfFile.pdf";
            pdfFile.SaveAs(pdfFileName);

            return View();
        }


    }
}

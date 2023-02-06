using ClientMSystem;
using ClientMSystem.Data;
using ClientMSystem.Services.EmailService;
using Karambolo.Extensions.Logging.File;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.DotNet.Scaffolding.Shared.ProjectModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using System.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<ApplicationContext>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.ExpireTimeSpan = TimeSpan.FromMinutes(1);
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/Login";
    });

//builder.Services.AddSingleton<ClientMSystem.Service.IEmailService, ClientMSystem.Service.EmailService>();
//builder.Services.AddSingleton<ILoggerProvider, CustomLoggerProvider>();

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddSession( options =>
    {
        options.IdleTimeout = TimeSpan.FromMinutes(30);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
    });

//builder.Services.AddLogging(builder =>
//{
//    builder.AddFile(o => o.RootPath = "internal-nlog.txt");
//});

builder.Services.AddLogging(loggingBuilder => loggingBuilder.AddConsole());

var config = new ConfigurationBuilder()

  .SetBasePath(System.IO.Directory.GetCurrentDirectory())
  .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true).Build();

NLog.Config.LoggingConfiguration nlogConfig = new NLogLoggingConfiguration(config.GetSection("NLog"));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();


//builder.Services.AddSingleton(SMTPConfig);

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

app.Run();


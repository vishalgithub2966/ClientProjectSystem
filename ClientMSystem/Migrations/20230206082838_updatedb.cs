using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClientMSystem.Migrations
{
    public partial class updatedb : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "smtpConfigModel");

            migrationBuilder.DropTable(
                name: "userEmailOPtions");

            migrationBuilder.CreateTable(
                name: "emailDto",
                columns: table => new
                {
                    To = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Attachments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "emailDto");

            migrationBuilder.CreateTable(
                name: "smtpConfigModel",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Enablessl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Host = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsBodyHTML = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<int>(type: "int", nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    SenderAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SenderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_smtpConfigModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "userEmailOPtions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToEmails = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_userEmailOPtions", x => x.Id);
                });
        }
    }
}

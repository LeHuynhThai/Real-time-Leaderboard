using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repository.Migrations
{
    /// <inheritdoc />
    public partial class updateUser1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScoreSubmissions_UserId",
                table: "ScoreSubmissions");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreSubmissions_UserId",
                table: "ScoreSubmissions",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScoreSubmissions_UserId",
                table: "ScoreSubmissions");

            migrationBuilder.CreateIndex(
                name: "IX_ScoreSubmissions_UserId",
                table: "ScoreSubmissions",
                column: "UserId");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealHunter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsInitializedToSearchRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsInitialized",
                table: "SearchRules",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsInitialized",
                table: "SearchRules");
        }
    }
}

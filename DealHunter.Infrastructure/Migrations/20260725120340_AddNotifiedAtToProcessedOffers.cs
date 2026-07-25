using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealHunter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotifiedAtToProcessedOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "NotifiedAt",
                table: "ProcessedOffers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedOffers_NotifiedAt",
                table: "ProcessedOffers",
                column: "NotifiedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProcessedOffers_NotifiedAt",
                table: "ProcessedOffers");

            migrationBuilder.DropColumn(
                name: "NotifiedAt",
                table: "ProcessedOffers");
        }
    }
}

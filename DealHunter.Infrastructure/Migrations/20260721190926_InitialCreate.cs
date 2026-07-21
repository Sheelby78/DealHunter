using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DealHunter.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SearchRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChatId = table.Column<long>(type: "bigint", nullable: false),
                    Url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    MaxPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SearchRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessedOffers",
                columns: table => new
                {
                    OfferId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    RuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OfferUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    ProcessedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessedOffers", x => x.OfferId);
                    table.ForeignKey(
                        name: "FK_ProcessedOffers_SearchRules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "SearchRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedOffers_ProcessedAt",
                table: "ProcessedOffers",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedOffers_RuleId",
                table: "ProcessedOffers",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchRules_ChatId",
                table: "SearchRules",
                column: "ChatId");

            migrationBuilder.CreateIndex(
                name: "IX_SearchRules_IsActive",
                table: "SearchRules",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessedOffers");

            migrationBuilder.DropTable(
                name: "SearchRules");
        }
    }
}

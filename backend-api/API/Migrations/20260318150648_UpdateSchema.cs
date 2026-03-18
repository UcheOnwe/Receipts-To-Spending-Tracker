using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PurchaseDate",
                table: "Receipts",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "Ammount",
                table: "Receipts",
                newName: "Amount");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Receipts",
                newName: "PurchaseDate");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Receipts",
                newName: "Ammount");
        }
    }
}

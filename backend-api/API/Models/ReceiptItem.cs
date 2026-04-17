using System;

namespace API.Models;

public class ReceiptItem
{
    public int Id { get; set; }
    public int ReceiptId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
    public string Category {get; set; } =string.Empty;


    // Calculated property for total (Quantity * Price)
    public decimal Total => Quantity * Price;
    //Navigation property
    //One receipt is assigned to many receipts item
    public Receipt? Receipt { get; set; }
}




using System;

namespace API.Dtos;

//When a User wants to ADD an Item to an Existing Receipt
public class ReceiptItemDto
{
    public int ReceiptId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public Decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
    public string Category { get; set; } = string.Empty;
}

// When the user wants to update an EXISTING receipt Item
public class ReceiptItemUpdateDto
{
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public Decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
}

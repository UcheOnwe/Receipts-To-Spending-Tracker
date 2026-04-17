using System;

namespace API.Dtos;

// What the Api returns after creating or fetching receipt
public class ReceiptResponseDto
{
    public int ReceiptId { get; set; }
    public string Store { get; set; } = string.Empty;
    public Decimal Amount { get; set; } //Total of all Items
    public DateTime Date { get; set; }

    public List<ReceiptItemResponseDto> Items { get; set;} = new List<ReceiptItemResponseDto>();
}

//What the API returns for each Item
public class ReceiptItemResponseDto
{
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public Decimal Price { get; set; }
    public int Quantity { get; set; }
    public Decimal Total { get; set; } //Calculated: Price * Quantity
    public string Category {get; set; } = string.Empty;
}
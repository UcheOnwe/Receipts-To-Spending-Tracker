using System;

namespace API.Dtos;

//What the user sends when creating a receipt
public class CreateReceiptDto
{
    public string Store { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public List<CreateReceiptItemDto> Items { get; set;} = new List<CreateReceiptItemDto>();

}


//What the user sends when creating a Receipt Item
public class CreateReceiptItemDto
{
    public string ItemName { get; set; } = string.Empty;
    public Decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Category { get; set; }
}



using System;

namespace API.Models;

public class Receipt
{
    public int Id { get; set; }
    public int UserId { get; set; }  // Will hardcode to 1 for now
    public string Store { get; set; } = string.Empty;
    public decimal Amount { get; set;}
    public DateTime Date { get; set; }


        
    // Navigation property. This basically says one user
    //is assigned to receipt created
    public User? User {get; set;}
    public List<ReceiptItem> Items {get; set; }= new List<ReceiptItem>();
    
  
}

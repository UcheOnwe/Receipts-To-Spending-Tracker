using System;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace API.Models;

public class User
{
    public int id {get; set;}
    public string FullName { get; set;} = string.Empty;

    public string Email { get; set;} = string.Empty;

    public string Password { get; set;} = string.Empty;

    public decimal WeeklyLimit {get; set;} 


    //Navigation Property to understand one(user) to many(Receipts).
    //List<Receipts in this user class represents all the receipts that
    //belong to that user 
    public List<Receipt> Receipts {get; set;} = new List<Receipt>();

}

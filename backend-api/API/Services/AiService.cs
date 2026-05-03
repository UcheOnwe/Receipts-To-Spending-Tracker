using OpenAI;
using OpenAI.Responses;
using OpenAI.Files; //for input files
using OpenAI.Chat;
using System.Text;
using System;

using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Sprache;
using System.Reflection.Metadata.Ecma335;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using OpenAI.Audio;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using API.Dtos;
using API.Models;
using System.Text.Json;

namespace API.Services;

public class AiService
{

    public string Test() => "testing";
  

    private readonly ChatClient _chat;
    //for ai response test
    public AiService()
    {
        _chat = new ChatClient(
            "gpt-4o-mini",
            Environment.GetEnvironmentVariable("OPENAI_API_KEY")
        );
    }

    public async Task<string> GetAiResponseAsync(List<ReceiptResponseDto> receipts)
    {
         //I want to get a list of all receipts here
        var receiptJson = JsonSerializer.Serialize(receipts, new JsonSerializerOptions
        {
            WriteIndented =true
        });

        // very specific prompt needed
         var prompt = $@"
                Please analyze spending patterns.
                here are receipts
                {receiptJson}
                
                based off this data what are some recommended changes in spending habits to help save money,
                 keep the responce as a single paragraph and be consice";

        //send to AI for evaluation       
        var result = await _chat.CompleteChatAsync(
            new[]
            {
                ChatMessage.CreateUserMessage(prompt)
            }
        );

        return result.Value.Content[0].Text;
    }

    //image processing
    public async Task<string> ProcessImageUrlAsync(string imageUrl)
    {
        var message = ChatMessage.CreateUserMessage(
            new ChatMessageContentPart[]
            {
                ChatMessageContentPart.CreateTextPart(
                    "Please give me the following information: Name of the store, total money spent, numbered list of products purchased each on a new line"),
                ChatMessageContentPart.CreateImagePart(new Uri(imageUrl))    
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });

        return result.Value.Content[0].Text;
    }

    //Trying Base64
    public async Task<string> NameProcessImageBase64Async(string base64Image)
    {
        // Create message with base64 image
        var message = ChatMessage.CreateUserMessage(
            new ChatMessageContentPart[]
            {
                ChatMessageContentPart.CreateTextPart(
                    "Please return store name only, Example: Walmart. If Unable return: No name found"),
                // Use base64 image data directly
                ChatMessageContentPart.CreateImagePart(
                    BinaryData.FromBytes(Convert.FromBase64String(base64Image)),
                    "image/jpeg"
                )
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });
        return result.Value.Content[0].Text;
    }
    // ============================================
    // NEW METHOD - Get items with Base64
    // WHY: Same reason - avoid ngrok URL issues
    // ============================================
    public async Task<string> ProductProcessImageBase64Async(string base64Image)
    {
        var prompt = @"
                You are extracting structured data from a receipt.

                Each item must include a category chosen ONLY from this list:
                [Food & Dining, Groceries, Entertainment, Shopping, Transportation, Drink, Other]

                Output format:
                name-quantity-price-category-

                Rules:
                - If quantity is not specified, default to 1
                - Price should be a number without currency symbols
                - Include Taxes as if it was a product
                - Do not include total
                - Category must exactly match one of the provided options
                -Do not include subtotals
                -Do not return any other text

                Example:

                Input:
                Milk 2 $3.50
                Bread $2.00
                Movie Ticket $12.00
                Tax $1.20

                Output:
                Milk-2-3.50-Groceries-
                Bread-1-2.00-Groceries-
                Movie Ticket-1-12.00-Entertainment-
                Tax-1-1.20-Other-
                ";
                    
        var message = ChatMessage.CreateUserMessage(
            new ChatMessageContentPart[]
            {
                ChatMessageContentPart.CreateTextPart(prompt),
                // Use base64 image data directly
                ChatMessageContentPart.CreateImagePart(
                    BinaryData.FromBytes(Convert.FromBase64String(base64Image)),
                    "image/jpeg"
                )
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });
        return result.Value.Content[0].Text;
    }

    

    

    /*
    public async Task<string> NameProcessImageUrlAsync(string imageUrl)
    {
        var message = ChatMessage.CreateUserMessage(
            new ChatMessageContentPart[]
            {
                ChatMessageContentPart.CreateTextPart(
                    "Please return store name only, Example: Walmart. If Unable return:No name found"),
                ChatMessageContentPart.CreateImagePart(new Uri(imageUrl))    
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });

        return result.Value.Content[0].Text;
    }

    //get list of products with quantity and prices
    public async Task<string> ProductProcessImageUrlAsync(string imageUrl)
    {
        var prompt = @"
                You are extracting structured data from a receipt.

                Each item must include a category chosen ONLY from this list:
                [Food & Dining, Groceries, Entertainment, Shopping, Transportation, Drink, Other]

                Output format:
                name-quantity-price-category-

                Rules:
                - If quantity is not specified, default to 1
                - Price should be a number without currency symbols
                - Include Taxes as if it was a product
                - Do not include total
                - Category must exactly match one of the provided options
                -Do not include subtotals
                -Do not return any other text

                Example:

                Input:
                Milk 2 $3.50
                Bread $2.00
                Movie Ticket $12.00
                Tax $1.20

                Output:
                Milk-2-3.50-Groceries-
                Bread-1-2.00-Groceries-
                Movie Ticket-1-12.00-Entertainment-
                Tax-1-1.20-Other-
                ";
        var message = ChatMessage.CreateUserMessage(
            new ChatMessageContentPart[]
            {
                ChatMessageContentPart.CreateTextPart(prompt),
                ChatMessageContentPart.CreateImagePart(new Uri(imageUrl))    
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });

        
        return result.Value.Content[0].Text;
    }*/

    //go through list of items returned by the AI and make a new item object to populate reciept
    public static List<CreateReceiptItemDto> MakeList(string products)
    {
        int count =0; //counter to decide if product, quantity, price, or catagory
		int start = 0;
        string name = "";
        Decimal price = 0.0M;
        int quantity = 1;  //convert to decimal
        string category ="";                                             
        List<CreateReceiptItemDto> things = new List<CreateReceiptItemDto>(); 
		for(int x=0;x<products.Length;x++)
		{	
            int option = count%4;
           
			if(products[x] == '-')
			{				
                

				switch(option)
				{
                    case(0): //product 
                        string prod ="";
                        for(int i = start; i< x;i++)
                            {
                                prod = prod + products[i];
                            }
                        name = prod;
                        count++;
                        start = x+1;
                        break;

                    case(1): //quantity
                        string q =""; //need to get string before casting it to decimal 
                        int quant =0;		//need to change quantity to decimal in case of weight quantity
                        for(int i = start; i<x;i++)
                            {
                                q = q+products[i];
                            }
                        string tempQ="";
                        for(int i = 0; i<q.Length;i++)
                            {
                                if(char.IsNumber(q[i]))
                                {
                                    tempQ +=q[i];
                                }
                            }    
                        quant = Convert.ToInt32(tempQ);		//cast string to decimal
                        quantity = quant;
                        count++;
                        start = x+1;
                        break;

                    case(2): //price 
                        string p ="";		//string to get price
                        decimal pr =0.0M;
                        for(int i = start; i<x;i++)
                            {
                                p = p + products[i];
                            }
                        string tempP="";
                        
                        foreach(char ch in p)
                            {
                                if(char.IsDigit(ch) || ch == '.')
                                {
                                    tempP+=ch;
                                }
                            }
                        
                        if (string.IsNullOrWhiteSpace(tempP))
                        {
                            continue;
                        }
                        //pr = Convert.ToDecimal(p);
                        if(!decimal.TryParse(tempP, out pr))
                        {
                            Console.WriteLine($"Skipping invalid value: {p}, cleaned={tempP}");
                            continue;
                        }
                        price = pr;
                        
                        

                        count++;
                        start = x+1;
                        break;
                    case(3):
                        string c ="";       //string to get category
                        for(int i = start;i<x;i++)
                        {
                            c = c + products[i];
                        }
                        category = c;

                        //populate 1 item
                        CreateReceiptItemDto item = new CreateReceiptItemDto();
                        item.ItemName = name;
                        item.Quantity = quantity;
                        item.Price = price;
                        item.Category = category;
                        things.Add(item);

                        //reset values
                        name = "";
                        price = 0.0M;
                        quantity = 1;
                        category ="";

                        count++;
                        start = x+1;
                        break;
                    }
					
			}
		}
        return things;		
    }
} 
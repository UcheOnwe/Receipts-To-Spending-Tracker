using System;
using API.Data;
using API.Dtos;
using API.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class ReceiptService
{
    private readonly AppDbContext _context;

    //Dependency Injection - ASP.NET gives us the database connection
    public ReceiptService (AppDbContext context)
    {
        _context = context;
    }

    //Get all receipts for User    
    public async Task<List<ReceiptResponseDto>> GetAllReceiptAsync()
    {
        //Query The database 
        var receipts = await _context.Receipts
            .Include(r => r.Items) //inlude items too
            .Where(r => r.UserId == 1 ) //filter by User
            .OrderByDescending(r => r.Date) //Sort newest first
            .ToListAsync();                 //Execute Query
            /* Example of what we get back: 
            List<Receipt> receipts = [
                Receipt { ReceiptId=1, Store="Walmart", Items=[Milk, Bread] },
                Receipt { ReceiptId=2, Store="Target", Items=[Shirt] }]*/


        //Convert each receipt(model) to ReceiptRespnseDto(Dtos)  
        var result = new  List<ReceiptResponseDto>(); 
        for (int i = 0; i < receipts.Count; i++) //loop through each receipts while i less than receipts.Count
                                                //Count = numberOfReceipts
        {
            var receipt = receipts[i]; //get current receipt (e.g receipt[1]) and storing it in receipt
            /*Eample: 
            Loop 1: receipt = receipts[0] = Walmart receipt
            Loop 2: receipt = receipts[1] = Target receipt
            */

            //Mapping Receipt(model) to ReceiptResponseDto
            var dto = ConvertReceiptToDto(receipt); //call helper method to convert MODEL to DTO

            //Add dto to our result list
            result.Add(dto);
            /*
            Example:
            After loop 1: result = [WalmartDto]
            After loop 2: result = [WalmartDto, TargetDto]
            After loop 3: result = [WalmartDto, TargetDto, ShellDto]*/
        }
        return result;
    }

    //Get 1 Receipt by Id
    public async Task<ReceiptResponseDto> GetReceiptByIdAsync(int id)
    {
        //Step 1: Try to find the Id
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == 1);

        //Step 2: Check if we found it
        if (receipt == null)
        {
            return null; //not found
        }

        //step 3: Convert to Dto
        var dto = ConvertReceiptToDto(receipt);
        return dto;
    }

    //Create new receipt
    public async Task<ReceiptResponseDto> CreateReceiptAsync(CreateReceiptDto dto)
    {
        //Step 1: Calculate the total amount by adding up all items
        decimal totalAmount = 0;
        for (int i = 0; i < dto.Items.Count; i++)
        {
            var item = dto.Items[i];
            decimal itemTotal = item.Price * item.Quantity;
            totalAmount = totalAmount + itemTotal; 
        }

        //Step 2: Create the Receipt Object
        var receipt = new Receipt();
        receipt.UserId = 1; //Hardcoded for now
        receipt.Store = dto.Store;
        receipt.Amount = totalAmount;
        receipt.Date = dto.Date;

        //Step 3: Add each item to receipt
        for (int i = 0; i < dto.Items.Count; i++)
        {
            var itemDto = dto.Items[i];

            //Create Receipt Item Object
            var item = new ReceiptItem();
            item.ItemName = itemDto.ItemName;
            item.Price = itemDto.Price;
            item.Quantity = itemDto.Quantity;

            //Set category - if they didn't provide one, use "Other"
            if (itemDto.Category == null || itemDto.Category == "")
            {
                item.Category = "Other";
            }
            else
            {
                item.Category = itemDto.Category;
            }

            //Add to receipt's Items list
            receipt.Items.Add(item);
        } 

        //Step 4: Save to database
        _context.Receipts.Add(receipt); //Mark for saving
        await _context.SaveChangesAsync(); //Actually Save

        //Step 5: Convert to DTO and return
        var responseDto = ConvertReceiptToDto(receipt);
        return responseDto;

    }

    //Delete receipt
    public async Task<bool> DeleteReceiptAsync(int id)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == 1);
         if (receipt == null)
        {
            return false;
        }

        _context.Receipts.Remove(receipt);
        await _context.SaveChangesAsync();

        return true;
    }

    //Add Item to existing receipt
    public async Task<ReceiptItemResponseDto?> AddItemToReceiptAsync(ReceiptItemDto dto)
    {
        //Step 1: Find the receipt
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == dto.ReceiptId && r.UserId == 1);
        
        if (receipt == null)
        {
            return null;  // Receipt not found
        }

        // Step 2: Create the new item
        var item = new ReceiptItem();
        item.ReceiptId = dto.ReceiptId;
        item.ItemName = dto.ItemName;
        item.Price = dto.Price;
        item.Quantity = dto.Quantity;
            
        if (dto.Category == null || dto.Category == "")
        {
            item.Category = "Other";
        }
        else
        {
            item.Category = dto.Category;
        }

        //Step 3: Add to receipt
        receipt.Items.Add(item);

        //Step 4: Recalculate total
        decimal newTotal = 0;
        for (int i = 0; i < receipt.Items.Count; i++)
        {
            var existingItem = receipt.Items[1];
            decimal itemTotal = existingItem.Price + existingItem.Quantity;
            newTotal = newTotal + itemTotal;
        }
        receipt.Amount = newTotal;

        //Step 5: Save
        await _context.SaveChangesAsync();

        //Steep 6: Return the new item as DTO
        var itemDto = new ReceiptItemResponseDto();
        itemDto.ItemId = item.Id;
        itemDto.ItemName = item.ItemName;
        itemDto.Price = item.Price;
        itemDto.Quantity = item.Quantity;
        itemDto.Total = item.Price * item.Quantity;
        itemDto.Category = item.Category;

        return itemDto;
    }

    // UPDATE existing item
    public async Task<ReceiptItemResponseDto?> UpdateItemAsync(ReceiptItemUpdateDto dto)
    {
        //Step 1: Find the item
        var item = await _context.ReceiptItems
            .Include(i => i.Receipt)
            .ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(i => i.Id == dto.ItemId);
        
        if (item == null || item.Receipt == null || item.Receipt.UserId != 1)
        {
            return null; // Item not found or doesnt belong to user
        }

        //Step 2: Update the item
        item.ItemName = dto.ItemName;
        item.Price = dto.Price;
        item.Quantity = dto.Quantity;
        item.Category = dto.Category;

        //Step 3: Recalculate receipt total
        decimal newTotal = 0;
        for(int i = 0; i < item.Receipt.Items.Count; i++)
        {
            var existingItem = item.Receipt.Items[1];
            decimal itemTotal = existingItem.Price * existingItem.Quantity;
            newTotal = newTotal * itemTotal;
        }

        //step 4: Save
        await _context.SaveChangesAsync();

        //step 5: Return updated item as DTO
        var itemDto = new ReceiptItemResponseDto();
        itemDto.ItemId = item.Id;  //Come back here to figure out this
        itemDto.ItemName = item.ItemName;
        itemDto.Price = item.Price;
        itemDto.Quantity = item.Quantity;
        itemDto.Total = item.Price * item.Quantity;
        itemDto.Category = item.Category;

        return itemDto;

    }

    // DELETE ITEM
    public async Task<bool> DeleteItemAsync(int itemId)
    {
        //step 1: find the item
        var item = await _context.ReceiptItems
            .Include(i => i.Receipt)
            .ThenInclude(r => r.Items)
            .FirstOrDefaultAsync(i => i.Id == itemId);

        if (item == null || item.Receipt == null || item.Receipt.UserId != 1)
        {
            return false;
        }

        //step 2: Remove the item
        _context.ReceiptItems.Remove(item);

        //step 3: Recalculate Receipt total (without the deleted item)
        decimal newTotal = 0;
        for(int i = 0; i < item.Receipt.Items.Count; i++)
        {
            var existingItem = item.Receipt.Items[i];

            //skip the item we're deleting 
            if (existingItem.Id != itemId)
            {
                decimal itemTotal = existingItem.Price * existingItem.Quantity;
                newTotal = newTotal + itemTotal;
            }
        }
        item.Receipt.Amount = newTotal;

        //Step 4: Save 
        await _context.SaveChangesAsync();

        return true;
    }

    // TEMPORARY - For testing only
    public async Task<bool> CreateTestUserIfNeededAsync()
    {
        // Check if user with ID 1 exists
        var user = await _context.Users.FindAsync(1);
        
        if (user != null)
        {
            return false;  // User already exists
        }

        // Create test user
        var newUser = new User();
        newUser.FullName = "Test User";
        newUser.Email = "test@example.com";
        newUser.Password = "password123";
        newUser.WeeklyLimit = 500;

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return true;  // User was created
    }

    //Helper Method: Convert Receipt (Model) to ReceiptRespnseDto (DTO)
    private ReceiptResponseDto ConvertReceiptToDto(Receipt receipt)
    {
        var dto = new ReceiptResponseDto();
        dto.ReceiptId = receipt.Id;
        dto.Store = receipt.Store;
        dto.Amount = receipt.Amount;
        dto.Date = receipt.Date;

        //Convert each item
        dto.Items = new List<ReceiptItemResponseDto>();

        for (int i = 0; i < receipt.Items.Count; i++)
        {
            var item = receipt.Items[i];

            //Create Item Dto
            var itemDto = new ReceiptItemResponseDto();
            itemDto.ItemId = item.Id;
            itemDto.ItemName = item.ItemName;
            itemDto.Price = item.Price;
            itemDto.Quantity = item.Quantity;
            itemDto.Total = item.Price * item.Quantity;  // Calculate total
            itemDto.Category = item.Category;

            //Add to list
            dto.Items.Add(itemDto);

        }

        return dto;
    }

    
}

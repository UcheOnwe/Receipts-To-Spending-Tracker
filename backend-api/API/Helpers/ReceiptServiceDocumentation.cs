using System;

namespace API.Helpers;

/*
    Summary - GetAllReceiptsAsync
What it does: Get all receipts for user 1 from database and convert to DTOs
Steps:

1) Query database (with Items included, filtered by UserId, sorted by Date)
2) Get List<Receipt> (Models)
3) Create empty List<ReceiptResponseDto>
4) Loop through each Receipt
5) Convert each Receipt to DTO
6) Add DTO to result list
7) Return result

Concepts used:

Async/await
LINQ (.Include, .Where, .OrderByDescending)
For loop
List operations (.Add, .Count, indexing)
Model to DTO conversion
    
*/


using System;

namespace API.Dtos;

//What the API returns for spending insights
public class SpendingSummaryDto
{
    public Decimal TotalSpending { get; set; }
    public Decimal WeeklyLimit { get; set; }
    public Decimal WeeklySpending { get; set; }
    public bool OverBudget { get; set; }
    public int ReceiptCount {get; set;}

    public List<CategorySpendingDto> CategoryBreakdown { get; set;} = new List<CategorySpendingDto>();
    public List<string> SpendingTips {get; set;} = new List<string>();

}

public class CategorySpendingDto
{
    public string CategoryName { get; set; } = string.Empty;
    public Decimal Total { get; set; }
    public int Percentage { get; set; }
    public int ReeceiptCount { get; set; }

}

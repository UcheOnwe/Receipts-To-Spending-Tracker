using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set;}
    public DbSet<Receipt> Receipts {get; set;}
    public DbSet<ReceiptItem> ReceiptItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //Configure User-receipts relationship
        modelBuilder.Entity<Receipt>()
        .HasOne(r => r.User)
        .WithMany(u => u.Receipts)
        .HasForeignKey(r => r.UserId);


        // Receipt-ReceiptItem relationship
        modelBuilder.Entity<ReceiptItem>()
            .HasOne(i => i.Receipt)
            .WithMany(r => r.Items)
            .HasForeignKey(i => i.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade); // Delete items when receipt is deleted
    }

    
}

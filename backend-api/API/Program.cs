using API.Data;
using API.Services;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

//load envireonment variables
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register services
builder.Services.AddScoped<ReceiptService>();

builder.Services.AddScoped<AiService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configure the HTTP request pipeline. (middleware)
app.UseRouting();
//app.UseHttpsRedirection();    //commented out for local testing
app.UseStaticFiles();           //to properly send URL to OpenAI
app.UseAuthorization();


app.MapControllers();

//added to allow external devices
app.Urls.Add("http://0.0.0.0:5000");
app.Run();

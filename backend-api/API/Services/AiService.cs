using OpenAI;
using OpenAI.Responses;
//using System;
//using System.Threading.Tasks;
using OpenAI.Files; //for input files
using OpenAI.Chat;
using System.Text;

using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Sprache;
using System.Reflection.Metadata.Ecma335;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using OpenAI.Audio;
using Microsoft.EntityFrameworkCore.ChangeTracking;

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

    public async Task<string> GetAiResponseAsync(string prompt)
    {
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
                ChatMessageContentPart.CreateTextPart("text"),
                ChatMessageContentPart.CreateImagePart(new Uri(imageUrl))    
            }
        );

        var result = await _chat.CompleteChatAsync(new[] { message });

        return result.Value.Content[0].Text;
    }
} 
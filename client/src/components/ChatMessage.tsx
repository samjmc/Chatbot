import React from "react";
import { MessageResponse } from "@shared/schema";

interface ChatMessageProps {
  message: MessageResponse;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Determine if this is a user or assistant message
  const isUserMessage = message.role === "user";
  
  // Format message content (handle bullet points, links, etc.)
  const formatMessageContent = (content: string) => {
    // Replace URLs with links
    const withLinks = content.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
    );
    
    // Identify bullet point lists (lines starting with - or * or numbers)
    let formattedContent = withLinks;
    
    // Create paragraphs
    formattedContent = formattedContent
      .split('\n\n')
      .map(para => `<p>${para}</p>`)
      .join('');
    
    // Replace single newlines with <br> if not already in a paragraph
    formattedContent = formattedContent.replace(/([^>])\n([^<])/g, '$1<br>$2');
    
    return { __html: formattedContent };
  };
  
  if (isUserMessage) {
    return (
      <div className="flex items-start justify-end">
        <div className="bg-tableau-blue text-white rounded-lg rounded-tr-none p-3 max-w-[85%]">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 rounded-full bg-tableau-blue flex items-center justify-center flex-shrink-0 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
        </svg>
      </div>
      <div className="bg-tableau-light dark:bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-[85%]">
        <div 
          className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap" 
          dangerouslySetInnerHTML={formatMessageContent(message.content)}
        />
      </div>
    </div>
  );
}

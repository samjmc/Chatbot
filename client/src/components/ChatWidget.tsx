import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeTableauEmbedding, getEmbeddingContext, extractPageContext } from '../lib/tableauEmbeddingAPI';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TableauDashboardData {
  title: string;
  sheets: Array<{
    name: string;
    fields: string[];
    marks?: any[];
  }>;
  filters: Array<{
    field: string;
    values: string[];
  }>;
  parameters: Array<{
    name: string;
    value: string;
  }>;
}

interface ChatWidgetProps {
  tableauReady?: boolean;
  dashboardData?: TableauDashboardData | null;
}

export default function ChatWidget({ tableauReady = false, dashboardData = null }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTableauConnected, setIsTableauConnected] = useState(false);
  const [dashboardContext, setDashboardContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initializeConnection = async () => {
    try {
      console.log("ChatWidget: Initializing connection...");
      
      // Try Tableau Embedding API v3 first for better dashboard integration
      const embeddingConnected = await initializeTableauEmbedding();
      const embeddingContext = await getEmbeddingContext();
      const pageContext = extractPageContext();
      
      console.log("Embedding API connected:", embeddingConnected);
      console.log("Dashboard context:", embeddingContext);
      console.log("Page context:", pageContext);
      
      const finalConnected = embeddingConnected || embeddingContext.isEmbedded;
      setIsTableauConnected(finalConnected);
      
      if (finalConnected) {
        // Store rich context from Embedding API
        setDashboardContext({
          ...embeddingContext,
          ...pageContext,
          embedded: true
        });
        
        // Set context-aware welcome message based on actual dashboard data
        let welcomeMessage = "Hi! I'm your RWA Assistant 🤖 ";
        
        if (dashboardData && dashboardData.sheets.length > 0) {
          const sheetNames = dashboardData.sheets.map(s => s.name).join(', ');
          const allFields = dashboardData.sheets.flatMap(s => s.fields);
          
          welcomeMessage += `I'm connected to your "${dashboardData.title}" dashboard with sheets: ${sheetNames}. `;
          
          if (allFields.some(f => f.toLowerCase().includes('patient') || f.toLowerCase().includes('nhs'))) {
            welcomeMessage += "I can see NHS healthcare data with patient metrics and financial information. What insights would you like about your healthcare performance?";
          } else if (allFields.some(f => f.toLowerCase().includes('margin') || f.toLowerCase().includes('drug'))) {
            welcomeMessage += "I can see pharmaceutical margin data with drug categories and business metrics. What would you like to analyze about your margin performance?";
          } else {
            welcomeMessage += `I can analyze data including: ${allFields.slice(0, 5).join(', ')}${allFields.length > 5 ? ', and more' : ''}. What insights would you like?`;
          }
        } else if (pageContext.dashboardType.includes('NHS')) {
          welcomeMessage += "I can see you're viewing NHS healthcare financial data. I can help analyze patient metrics, claimed items, and healthcare performance trends. What would you like to know about your NHS data?";
        } else if (pageContext.dashboardType.includes('Pharmaceutical')) {
          welcomeMessage += "I can see you're viewing pharmaceutical margin analysis data. I can help analyze drug category performance, procurement metrics, and business insights. What would you like to explore about your margin data?";
        } else {
          welcomeMessage += "I'm embedded in your dashboard and ready to analyze the financial data you're viewing. What specific insights would you like about your current metrics?";
        }
        
        setMessages([{
          role: "assistant", 
          content: welcomeMessage
        }]);
      } else {
        console.log("ChatWidget: Not embedded, running as standalone assistant");
        
        // Set a general welcome message for standalone mode
        setMessages([{
          role: "assistant", 
          content: `Hi! I'm your RWA Assistant 🤖 I'm ready to help analyze dashboard data and provide business insights. What would you like to know?`
        }]);
        
        setDashboardContext({
          dashboardType: 'General Financial Dashboard',
          dataCategories: [],
          metrics: [],
          embedded: false
        });
      }
    } catch (error) {
      console.error("Error initializing Tableau connection:", error);
      setMessages([{
        role: "assistant", 
        content: "Hi! I'm your RWA Assistant 🤖 I'm ready to help with your data analysis questions. What would you like to know?"
      }]);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConnection();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: dashboardContext,
          isTableauConnected,
          dashboardData: dashboardData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add assistant response - handle the nested message structure
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message?.content || data.content || 'Sorry, I had trouble generating a response.'
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">RWA Assistant</h3>
              <p className="text-sm text-purple-100">
                {isTableauConnected ? "🤖 Connected to your dashboard" : "🤖 Ready to help"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t bg-gray-50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your dashboard data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Terminal, Code2 } from 'lucide-react';
import { ChatMessage, AppIdea, ArchitectureDetails } from '../types';
import { streamChat } from '../services/gemini';
import { Button } from './Button';

interface ChatInterfaceProps {
  idea: AppIdea;
  architecture: ArchitectureDetails;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ idea, architecture }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context = `
    App Title: ${idea.title}
    Description: ${idea.description}
    Tech Stack: Spring Boot, React, ${idea.techStackHighlights.join(', ')}
    
    Architecture Highlights:
    - Modules: ${architecture.springBootModules.join(', ')}
    - Components: ${architecture.reactComponents.join(', ')}
    - Database: ${architecture.databaseSchema.substring(0, 200)}...
  `;

  useEffect(() => {
    // Reset chat when idea changes
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: `I've loaded the architecture for **${idea.title}**. \n\nI can help you with:\n- Generating Spring Boot Entity/Controller code\n- Writing React components\n- Explaining specific architectural decisions\n\nWhat would you like to build first?`,
      timestamp: Date.now()
    }]);
  }, [idea.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const responseMsgId = (Date.now() + 1).toString();
      let accumulatedText = '';
      
      // Add placeholder for model response
      setMessages(prev => [...prev, {
        id: responseMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      const stream = streamChat(
        userMsg.text, 
        messages.filter(m => m.id !== 'welcome'), // Don't send welcome message in API history
        context
      );

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === responseMsgId 
            ? { ...msg, text: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
      <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-slate-200">Architect Assistant</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Code2 className="w-3 h-3" />
          Context Active
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1117]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800/80 text-slate-300 rounded-bl-none border border-slate-700/50'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask to generate code (e.g., 'Show me the User Entity class')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-slate-500"
            disabled={isStreaming}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isStreaming}
            variant="primary"
            className="px-6"
          >
            {isStreaming ? (
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
                <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, FileText, Database, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore, Message } from '@/stores/useResumeStore';
import { cn } from '@/lib/utils';

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="typing-indicator flex gap-1">
      <span className="w-2 h-2 rounded-full bg-primary" />
      <span className="w-2 h-2 rounded-full bg-primary" />
      <span className="w-2 h-2 rounded-full bg-primary" />
    </div>
    <span className="text-sm text-muted-foreground ml-2">Agent is analyzing...</span>
  </div>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-chat-ai text-foreground rounded-bl-md border border-border/50"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Resume Agent</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] opacity-50 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

const QuickActions = ({ onAction }: { onAction: (action: string) => void }) => {
  const actions = [
    { icon: FileText, label: 'Analyze JD', action: 'analyze_jd' },
    { icon: Database, label: 'Search KB', action: 'search_kb' },
    { icon: History, label: 'View History', action: 'view_history' },
  ];

  return (
    <div className="flex gap-2 p-3 border-b border-border/50">
      {actions.map(({ icon: Icon, label, action }) => (
        <Button
          key={action}
          variant="glass"
          size="sm"
          onClick={() => onAction(action)}
          className="flex-1 text-xs"
        >
          <Icon className="w-3 h-3" />
          {label}
        </Button>
      ))}
    </div>
  );
};

export const ChatPanel = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    addMessage, 
    isAgentThinking, 
    setIsAgentThinking,
    setLatexContent,
    latexContent,
    setAtsScore,
    setMatchedKeywords
  } = useResumeStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAgentResponse = async (userMessage: string) => {
    setIsAgentThinking(true);
    
    // Simulate agent processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simple response logic based on keywords
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('job description') || lowerMessage.includes('jd')) {
      response = `I've analyzed the job description. Here's what I found:\n\n**Key Requirements:**\n• 5+ years of software engineering experience\n• Proficiency in React, TypeScript, and Node.js\n• Experience with cloud platforms (AWS/GCP)\n• Strong system design skills\n\n**Action Plan:**\n1. I'll rewrite your bullet points to mirror this language\n2. Adding relevant keywords from the JD\n3. Pulling matching experience from your knowledge base\n\nShall I proceed with the LaTeX modifications?`;
      
      // Simulate ATS score
      setAtsScore(72);
      setMatchedKeywords(['React', 'TypeScript', 'Node.js', 'AWS', 'system design']);
    } else if (lowerMessage.includes('modify') || lowerMessage.includes('update') || lowerMessage.includes('proceed')) {
      response = `Done. I've made the following changes to your LaTeX:\n\n✓ Updated Professional Summary to match JD language\n✓ Reworded 3 bullet points in Experience section\n✓ Added "system design" and "TypeScript" emphasis\n✓ Inserted achievement from knowledge base\n\nYour ATS compatibility score improved from 72% → 89%. The changes are highlighted in the editor.`;
      
      // Update the LaTeX with some modifications
      const updatedLatex = latexContent.replace(
        'Experienced software engineer with 5+ years of expertise',
        'Results-driven software engineer with 5+ years of expertise in TypeScript and React'
      );
      setLatexContent(updatedLatex);
      setAtsScore(89);
    } else if (lowerMessage.includes('knowledge') || lowerMessage.includes('kb')) {
      response = `I found 3 relevant items in your knowledge base:\n\n**1. E-commerce Platform** (Project)\nMatches: React, Node.js, PostgreSQL\n\n**2. Performance Optimization** (Achievement)\nMatches: Core Web Vitals, optimization\n\n**3. Cloud Architecture** (Skill)\nMatches: AWS, Kubernetes, DevOps\n\nWould you like me to incorporate any of these into your resume?`;
    } else {
      response = `I understand you want to optimize your resume. To help you best:\n\n1. **Paste a job description** - I'll extract key requirements\n2. **Ask me to analyze** - I'll compare it with your current resume\n3. **Say "proceed"** - I'll modify your LaTeX directly\n\nI work in pure LaTeX, so your formatting stays intact. What would you like to do?`;
    }
    
    setIsAgentThinking(false);
    addMessage({ role: 'assistant', content: response });
  };

  const handleSend = async () => {
    if (!input.trim() || isAgentThinking) return;
    
    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    
    await simulateAgentResponse(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'analyze_jd':
        setInput('Analyze this job description and tell me what changes to make');
        inputRef.current?.focus();
        break;
      case 'search_kb':
        addMessage({ role: 'user', content: 'Search my knowledge base for relevant experience' });
        simulateAgentResponse('Search my knowledge base for relevant experience');
        break;
      case 'view_history':
        addMessage({ role: 'user', content: 'Show my resume version history' });
        addMessage({ 
          role: 'assistant', 
          content: 'Your version history is displayed in the sidebar. You have 3 saved versions. Click on any version to compare changes or restore it.' 
        });
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/50">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Resume Agent</h2>
          <p className="text-xs text-muted-foreground">AI-powered resume engineering</p>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isAgentThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-chat-ai rounded-2xl rounded-bl-md border border-border/50"
          >
            <TypingIndicator />
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/30">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a job description or ask me to optimize..."
              rows={1}
              className="w-full resize-none rounded-xl bg-secondary border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <Button
            variant="glow"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isAgentThinking}
            className="h-12 w-12 rounded-xl"
          >
            {isAgentThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

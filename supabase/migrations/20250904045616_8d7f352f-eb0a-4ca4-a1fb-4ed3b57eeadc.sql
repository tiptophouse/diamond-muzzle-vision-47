-- Create table for incoming chatbot messages
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  message_text TEXT NOT NULL,
  chat_id BIGINT NOT NULL,
  chat_type TEXT NOT NULL DEFAULT 'private',
  chat_title TEXT,
  sender_info JSONB NOT NULL,
  parsed_data JSONB,
  confidence_score NUMERIC DEFAULT 0,
  message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see messages they sent or messages in groups they're part of
CREATE POLICY "Users can view their own messages and group messages" 
ON public.chatbot_messages 
FOR SELECT 
USING (true); -- For now allow all, can be restricted later

-- Create index for better performance
CREATE INDEX idx_chatbot_messages_telegram_id ON public.chatbot_messages(telegram_id);
CREATE INDEX idx_chatbot_messages_chat_id ON public.chatbot_messages(chat_id);
CREATE INDEX idx_chatbot_messages_timestamp ON public.chatbot_messages(message_timestamp DESC);
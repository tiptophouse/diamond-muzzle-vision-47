-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create diamond_embeddings table for AI vector search
CREATE TABLE IF NOT EXISTS public.diamond_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diamond_id INTEGER NOT NULL,
  stock_number TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS diamond_embeddings_embedding_idx ON public.diamond_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for stock_number lookup
CREATE INDEX IF NOT EXISTS diamond_embeddings_stock_number_idx ON public.diamond_embeddings(stock_number);

-- Enable RLS
ALTER TABLE public.diamond_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for AI search
CREATE POLICY "Allow public read access for AI search"
  ON public.diamond_embeddings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts"
  ON public.diamond_embeddings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create ai_concierge_analytics table for tracking AI interactions
CREATE TABLE IF NOT EXISTS public.ai_concierge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT,
  telegram_group_id BIGINT,
  query_text TEXT,
  diamonds_matched INTEGER,
  response_time_ms INTEGER,
  user_clicked BOOLEAN DEFAULT false,
  conversion_occurred BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS ai_concierge_analytics_created_at_idx ON public.ai_concierge_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_concierge_analytics_telegram_id_idx ON public.ai_concierge_analytics(telegram_id);

-- Enable RLS
ALTER TABLE public.ai_concierge_analytics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY "Allow authenticated access"
  ON public.ai_concierge_analytics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
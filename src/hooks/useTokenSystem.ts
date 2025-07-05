
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

const TOKENS_PER_GENERATION = 5;
const FREE_TOKENS = 100;
const TOKEN_STORAGE_KEY = 'ai_description_tokens';

export function useTokenSystem() {
  const [tokens, setTokens] = useState<number>(FREE_TOKENS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  // Load tokens from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const storageKey = `${TOKEN_STORAGE_KEY}_${user.id}`;
      const savedTokens = localStorage.getItem(storageKey);
      if (savedTokens !== null) {
        setTokens(parseInt(savedTokens, 10));
      } else {
        // First time user, give them free tokens
        setTokens(FREE_TOKENS);
        localStorage.setItem(storageKey, FREE_TOKENS.toString());
      }
    }
  }, [user?.id]);

  // Save tokens to localStorage whenever they change
  const updateTokens = (newTokens: number) => {
    if (user?.id) {
      const storageKey = `${TOKEN_STORAGE_KEY}_${user.id}`;
      setTokens(newTokens);
      localStorage.setItem(storageKey, newTokens.toString());
    }
  };

  const canGenerate = tokens >= TOKENS_PER_GENERATION;

  const consumeTokens = () => {
    if (!canGenerate) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${TOKENS_PER_GENERATION} tokens to generate a description. Purchase more tokens to continue.`,
        variant: "destructive",
      });
      return false;
    }
    
    const newTokens = tokens - TOKENS_PER_GENERATION;
    updateTokens(newTokens);
    
    if (newTokens <= 10 && newTokens > 0) {
      toast({
        title: "Low Tokens",
        description: `You have ${newTokens} tokens remaining. Consider purchasing more.`,
      });
    } else if (newTokens === 0) {
      toast({
        title: "Tokens Depleted",
        description: "You've used all your free tokens. Purchase more to continue generating descriptions.",
      });
    }
    
    return true;
  };

  const addTokens = (amount: number) => {
    const newTokens = tokens + amount;
    updateTokens(newTokens);
    toast({
      title: "Tokens Added",
      description: `${amount} tokens have been added to your account. You now have ${newTokens} tokens.`,
    });
  };

  return {
    tokens,
    canGenerate,
    consumeTokens,
    addTokens,
    isLoading,
    setIsLoading,
    tokensPerGeneration: TOKENS_PER_GENERATION,
  };
}

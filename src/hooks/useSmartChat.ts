
import { useState } from 'react';
import { useOpenAIChat } from './useOpenAIChat';
import { useInventoryData } from './useInventoryData';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api, apiEndpoints } from '@/lib/api';

export function useSmartChat() {
  const { user } = useTelegramAuth();
  const { allDiamonds } = useInventoryData();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { messages, sendMessage: sendOpenAIMessage, isLoading, clearMessages } = useOpenAIChat();

  const analyzeUserQuestion = (question: string): boolean => {
    const inventoryKeywords = [
      'how many', 'count', 'total', 'inventory', 'diamonds', 'stones',
      'stock', 'have', 'own', 'possess', 'carat', 'price', 'value',
      'shape', 'color', 'clarity', 'cut', 'worth', 'expensive', 'cheap'
    ];
    
    return inventoryKeywords.some(keyword => 
      question.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const generateInventoryContext = () => {
    if (!allDiamonds || allDiamonds.length === 0) {
      return "User has no diamonds in inventory.";
    }

    const totalDiamonds = allDiamonds.length;
    const totalCarats = allDiamonds.reduce((sum, d) => sum + d.carat, 0);
    const totalValue = allDiamonds.reduce((sum, d) => sum + d.price, 0);
    
    const shapeBreakdown = allDiamonds.reduce((acc, d) => {
      acc[d.shape] = (acc[d.shape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colorBreakdown = allDiamonds.reduce((acc, d) => {
      acc[d.color] = (acc[d.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clarityBreakdown = allDiamonds.reduce((acc, d) => {
      acc[d.clarity] = (acc[d.clarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
Current Inventory Summary:
- Total Diamonds: ${totalDiamonds}
- Total Carats: ${totalCarats.toFixed(2)} ct
- Total Value: $${totalValue.toLocaleString()}
- Average Price per Carat: $${(totalValue / totalCarats).toFixed(2)}

Shape Breakdown:
${Object.entries(shapeBreakdown).map(([shape, count]) => `- ${shape}: ${count} stones`).join('\n')}

Color Breakdown:
${Object.entries(colorBreakdown).map(([color, count]) => `- ${color}: ${count} stones`).join('\n')}

Clarity Breakdown:
${Object.entries(clarityBreakdown).map(([clarity, count]) => `- ${clarity}: ${count} stones`).join('\n')}

Most Expensive Diamond: $${Math.max(...allDiamonds.map(d => d.price)).toLocaleString()}
Least Expensive Diamond: $${Math.min(...allDiamonds.map(d => d.price)).toLocaleString()}
    `.trim();
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    setIsProcessing(true);
    
    try {
      const needsInventoryData = analyzeUserQuestion(content);
      
      let enhancedPrompt = content;
      
      if (needsInventoryData && user?.id) {
        console.log('Question requires inventory data, enhancing prompt...');
        const inventoryContext = generateInventoryContext();
        
        enhancedPrompt = `
User Question: ${content}

Current Inventory Data:
${inventoryContext}

Please answer the user's question based on their actual inventory data above. Be specific and use the real numbers from their inventory. If they ask about diamonds they have, refer to the exact counts and details provided.
        `.trim();
      }

      await sendOpenAIMessage(enhancedPrompt);
      
    } catch (error) {
      console.error('Smart chat error:', error);
      await sendOpenAIMessage(content);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading: isLoading || isProcessing,
    clearMessages,
  };
}

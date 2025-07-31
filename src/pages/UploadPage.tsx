
import React from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { AIEnhancedCsvValidator } from '@/components/upload/AIEnhancedCsvValidator';
import { useToast } from '@/hooks/use-toast';

export default function UploadPage() {
  const { toast } = useToast();

  const handleUploadSuccess = (data: any[], validationResult: any) => {
    console.log('🎉 AI-Enhanced Upload successful:', { 
      uploadedCount: data.length, 
      qualityScore: validationResult.aiInsights?.dataQualityScore,
      aiEnhancements: validationResult.aiEnhancements,
      sampleDiamond: data[0]
    });
    
    toast({
      title: "🤖 AI-Enhanced Upload Complete!",
      description: `Successfully uploaded ${validationResult.validRows} diamonds with AI optimization. Quality score: ${Math.round((validationResult.aiInsights?.dataQualityScore || 0.7) * 100)}%`,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6 pb-safe">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🤖 AI-Powered Diamond CSV Upload</h1>
        <p className="text-muted-foreground">
          Upload your diamond inventory with intelligent AI assistance
        </p>
        <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
          <span>✨ AI Validation</span>
          <span>•</span>
          <span>💬 Smart Questions</span>
          <span>•</span>
          <span>🔧 Auto-corrections</span>
          <span>•</span>
          <span>📊 Quality Scoring</span>
        </div>
      </div>
      
      <AIEnhancedCsvValidator onUploadSuccess={handleUploadSuccess} />
    </div>
  );
}

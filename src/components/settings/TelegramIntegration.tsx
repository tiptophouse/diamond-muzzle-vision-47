
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Bot, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

interface TelegramSettings {
  telegramGroupId: string;
  enableMessageAnalysis: boolean;
  autoReplyToQueries: boolean;
  notifyOnMatches: boolean;
}

export function TelegramIntegration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  
  const [settings, setSettings] = useState<TelegramSettings>({
    telegramGroupId: "-10012345678",
    enableMessageAnalysis: true,
    autoReplyToQueries: false,
    notifyOnMatches: true
  });
  
  const handleChange = (field: keyof TelegramSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // const result = await api.post('/telegram/test-connection', { telegramGroupId: settings.telegramGroupId });
      
      toast({
        title: "Connection Successful",
        description: "Diamond Muzzle bot is connected to your Telegram group.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to the Telegram group. Please verify the group ID.",
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const result = await api.post('/telegram/settings', settings);
      
      toast({
        title: "Telegram Settings Saved",
        description: "Your Telegram integration settings have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save Telegram settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot size={20} className="text-diamond-500" />
          Telegram Integration
        </CardTitle>
        <CardDescription>
          Connect to your Telegram group to monitor diamond-related conversations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="telegramGroupId">Telegram Group ID</Label>
          <div className="flex gap-2">
            <Input
              id="telegramGroupId"
              value={settings.telegramGroupId}
              onChange={(e) => handleChange("telegramGroupId", e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testLoading}
            >
              {testLoading ? "Testing..." : "Test Connection"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Find this in your Telegram group info or by asking @username_to_id_bot
          </p>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="enableMessageAnalysis">Message Analysis</Label>
            <p className="text-xs text-muted-foreground">
              Analyze all messages in the group for diamond-related content
            </p>
          </div>
          <Switch
            id="enableMessageAnalysis"
            checked={settings.enableMessageAnalysis}
            onCheckedChange={(checked) => handleChange("enableMessageAnalysis", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="autoReplyToQueries">Auto-Reply to Queries</Label>
            <p className="text-xs text-muted-foreground">
              Let the bot automatically respond to diamond inquiries
            </p>
          </div>
          <Switch
            id="autoReplyToQueries"
            checked={settings.autoReplyToQueries}
            onCheckedChange={(checked) => handleChange("autoReplyToQueries", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifyOnMatches">Notify on Inventory Matches</Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications when group messages match your inventory
            </p>
          </div>
          <Switch
            id="notifyOnMatches"
            checked={settings.notifyOnMatches}
            onCheckedChange={(checked) => handleChange("notifyOnMatches", checked)}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          <MessageSquare size={14} className="inline mr-1" />
          Last sync: 5 minutes ago
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Zap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateTelegramDeepLink } from '@/hooks/useTelegramDeepLink';

export function DeepLinkGenerator() {
  const [botUsername, setBotUsername] = useState('mazal_bot');
  const { toast } = useToast();

  const pages = [
    { id: 'campaigns', name: 'Campaigns', description: 'Campaign dashboard' },
    { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard' },
    { id: 'inventory', name: 'Inventory', description: 'User inventory' },
    { id: 'store', name: 'Store', description: 'Diamond store' },
    { id: 'notifications', name: 'Notifications', description: 'Notifications page' },
    { id: 'settings', name: 'Settings', description: 'User settings' },
  ];

  const copyToClipboard = (link: string, pageName: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: `${pageName} deep link copied to clipboard`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Deep Link Generator
        </CardTitle>
        <CardDescription>
          Generate Telegram deep links to navigate users directly to specific pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="botUsername">Bot Username</Label>
          <Input
            id="botUsername"
            value={botUsername}
            onChange={(e) => setBotUsername(e.target.value)}
            placeholder="your_bot"
          />
          <p className="text-xs text-muted-foreground">
            Enter your Telegram bot username (without @)
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Available Deep Links
          </h4>
          {pages.map((page) => {
            const link = generateTelegramDeepLink(botUsername, page.id);
            return (
              <Card key={page.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium">{page.name}</h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {page.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                        {link}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link, page.name)}
                      className="gap-2"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            💡 How to use in campaigns
          </h4>
          <p className="text-xs text-muted-foreground">
            Use these links in your Telegram bot messages with inline buttons to redirect users
            directly to specific pages in your app. For example:
          </p>
          <code className="block text-xs bg-background p-2 rounded mt-2">
            {`{
  "text": "📊 View Campaigns",
  "url": "${generateTelegramDeepLink(botUsername, 'campaigns')}"
}`}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

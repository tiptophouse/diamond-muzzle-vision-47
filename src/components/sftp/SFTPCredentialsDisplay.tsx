
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  User, 
  Key, 
  Folder,
  Copy, 
  Eye, 
  EyeOff,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SFTPCredentialsDisplayProps {
  account: {
    id: string;
    ftp_username: string;
    ftp_folder_path: string;
    status: string;
    created_at: string;
    expires_at?: string;
    last_used_at?: string;
    password?: string; // Only available immediately after generation
  };
}

export function SFTPCredentialsDisplay({ account }: SFTPCredentialsDisplayProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${field} copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const serverHost = "sftp.diamonds.app"; // This would come from environment

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            SFTP Connection Details
          </CardTitle>
          <CardDescription>
            Use these credentials to connect to our SFTP server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="server">Server</Label>
              <div className="flex gap-2">
                <Input
                  id="server"
                  value={serverHost}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(serverHost, "Server")}
                >
                  {copiedField === "Server" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={account.ftp_username}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(account.ftp_username, "Username")}
                >
                  {copiedField === "Username" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {account.password && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={account.password}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(account.password!, "Password")}
                  >
                    {copiedField === "Password" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="folder">Upload Folder</Label>
              <div className="flex gap-2">
                <Input
                  id="folder"
                  value={account.ftp_folder_path}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(account.ftp_folder_path, "Folder")}
                >
                  {copiedField === "Folder" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {account.password && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> This password is only shown once. 
                Please save it securely. You can rotate it anytime if needed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p><strong>Port:</strong> 22 (default SFTP port)</p>
            <p><strong>Protocol:</strong> SFTP (SSH File Transfer Protocol)</p>
            <p><strong>File Format:</strong> CSV with diamond data</p>
          </div>
          
          <Alert>
            <Folder className="h-4 w-4" />
            <AlertDescription>
              Upload CSV files to your designated folder. Files are processed automatically 
              and you'll receive notifications about the upload status.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

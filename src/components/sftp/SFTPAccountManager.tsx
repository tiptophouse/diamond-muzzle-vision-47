
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Key, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { useSFTPAccount } from '@/hooks/sftp/useSFTPAccount';
import { useToast } from '@/hooks/use-toast';
import { SFTPCredentialsDisplay } from './SFTPCredentialsDisplay';
import { SFTPUploadHistory } from './SFTPUploadHistory';
import { SFTPStatusIndicator } from './SFTPStatusIndicator';

export function SFTPAccountManager() {
  const { 
    account, 
    loading, 
    generateAccount, 
    rotatePassword, 
    revokeAccount,
    testConnection
  } = useSFTPAccount();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleGenerateAccount = async () => {
    try {
      await generateAccount();
      toast({
        title: "SFTP Account Created",
        description: "Your SFTP credentials have been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Create Account",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleRotatePassword = async () => {
    try {
      await rotatePassword();
      toast({
        title: "Password Rotated",
        description: "Your SFTP password has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to Rotate Password",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAccount = async () => {
    try {
      await revokeAccount();
      toast({
        title: "Account Revoked",
        description: "Your SFTP access has been revoked.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Failed to Revoke Account",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to test connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading SFTP settings...
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Create SFTP Account
          </CardTitle>
          <CardDescription>
            Generate secure SFTP credentials for bulk diamond uploads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Secure Bulk Upload</AlertTitle>
            <AlertDescription>
              SFTP allows you to upload CSV files directly to our server for automatic processing. 
              Your credentials are encrypted and can be revoked at any time.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleGenerateAccount} className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Generate SFTP Credentials
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SFTPStatusIndicator account={account} />
      
      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials" className="space-y-4">
          <SFTPCredentialsDisplay account={account} />
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleTestConnection} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button onClick={handleRotatePassword} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rotate Password
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <SFTPUploadHistory />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Revoke SFTP Access</AlertTitle>
                <AlertDescription>
                  This will permanently disable your SFTP account and delete all credentials. 
                  You can create a new account later if needed.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRevokeAccount} 
                variant="destructive"
                className="w-full"
              >
                Revoke SFTP Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

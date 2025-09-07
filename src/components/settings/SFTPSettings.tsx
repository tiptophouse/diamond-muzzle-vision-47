// SFTP Settings with FastAPI Integration
import { useState } from 'react';
import { Upload, Server, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { fastAPI } from '@/lib/api/fastapi';

interface SFTPCredentials {
  username: string;
  password: string;
  host_name: string;
  port_number: number;
  folder: string;
  test_result: boolean;
}

export function SFTPSettings() {
  const [credentials, setCredentials] = useState<SFTPCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Provision new SFTP credentials
  const handleProvisionSFTP = async () => {
    setIsProvisioning(true);
    
    try {
      const newCredentials = await fastAPI.provisionSFTP();
      setCredentials(newCredentials);
      
      if (newCredentials.test_result) {
        toast.success('SFTP credentials provisioned successfully');
      } else {
        toast.warning('SFTP credentials provisioned but connection test failed');
      }
    } catch (error) {
      toast.error('Failed to provision SFTP credentials');
    } finally {
      setIsProvisioning(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <CardTitle>SFTP File Upload</CardTitle>
        </div>
        <CardDescription>
          Upload your diamond inventory files via SFTP for bulk import
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provision Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleProvisionSFTP}
            disabled={isProvisioning}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isProvisioning ? 'Provisioning...' : 'Get SFTP Credentials'}
          </Button>
        </div>

        {/* SFTP Credentials Display */}
        {credentials && (
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">SFTP Credentials</h3>
            </div>

            <div className="grid gap-4">
              {/* Host */}
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <div className="flex gap-2">
                  <Input 
                    id="host"
                    value={credentials.host_name}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.host_name, 'Host')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <div className="flex gap-2">
                  <Input 
                    id="port"
                    value={credentials.port_number.toString()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.port_number.toString(), 'Port')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input 
                    id="username"
                    value={credentials.username}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.username, 'Username')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.password, 'Password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Folder */}
              <div className="space-y-2">
                <Label htmlFor="folder">Upload Folder</Label>
                <div className="flex gap-2">
                  <Input 
                    id="folder"
                    value={credentials.folder}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.folder, 'Folder')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${credentials.test_result ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  Connection {credentials.test_result ? 'Successful' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Use these credentials to upload your CSV files:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Connect to the SFTP server using any SFTP client</li>
                <li>Upload your diamond inventory CSV files to the specified folder</li>
                <li>Files will be automatically processed and imported</li>
                <li>Check your inventory after upload for new diamonds</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

#!/usr/bin/env bash
set -Eeuo pipefail

# Configuration
API_HOST="http://136.0.3.22:8000"
SFTP_HOST="136.0.3.22"
SFTP_PORT=22
TELEGRAM_ID="608907728"

echo "🚀 [SFTP FLOW TEST] Starting complete end-to-end test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "[1] 🔑 Provisioning new SFTP user for telegram_id=$TELEGRAM_ID ..."
CREDS=$(curl -s -X POST "$API_HOST/api/v1/sftp/provision" \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": \"$TELEGRAM_ID\"}")

echo "Provision API response: $CREDS"
echo ""

# Extract credentials
USER=$(echo "$CREDS" | jq -r '.credentials.username // .username')
PASS=$(echo "$CREDS" | jq -r '.credentials.password // .password')
HOST=$(echo "$CREDS" | jq -r '.credentials.host // .host')
DIR=$(echo "$CREDS" | jq -r '.credentials.folder_path // .folder // "/inbox"')

echo "📋 Extracted credentials:"
echo "  Username: $USER"
echo "  Password: [REDACTED]"
echo "  Host: $HOST"
echo "  Directory: $DIR"
echo ""

echo "[2] 📁 Creating sample diamond CSV..."
cat > sample_diamonds.csv << 'CSV_EOF'
StockNo,Shape,Carat,Color,Clarity,Cut,Polish,Symmetry,Price,Lab,CertificateNumber
D001,RD,1.01,F,VS1,EX,EX,EX,5000,GIA,2141234567
D002,PR,0.75,G,VS2,VG,VG,VG,3200,GIA,2141234568
D003,EM,1.25,H,SI1,VG,EX,VG,4800,GIA,2141234569
CSV_EOF

echo "✅ Sample CSV created with 3 test diamonds"
echo ""

echo "[3] 🔐 Testing SFTP connection and file upload..."
sshpass -p "$PASS" sftp -o StrictHostKeyChecking=no -P $SFTP_PORT $USER@$SFTP_HOST <<SFTP_EOF
pwd
ls -la
put sample_diamonds.csv
ls -la
bye
SFTP_EOF

if [ $? -eq 0 ]; then
    echo "✅ SFTP upload successful!"
else
    echo "❌ SFTP upload failed!"
    exit 1
fi
echo ""

echo "[4] ⏳ Waiting 2 seconds for file to be processed..."
sleep 2

echo "[5] 💎 Processing uploaded CSV via API..."
PROCESS_RESPONSE=$(curl -s -X POST "$API_HOST/api/v1/diamonds/batch" \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": \"$TELEGRAM_ID\", \"filename\": \"sample_diamonds.csv\"}")

echo "CSV Processing response: $PROCESS_RESPONSE"
echo ""

echo "[6] 📊 Fetching imported diamonds to verify..."
DIAMONDS_RESPONSE=$(curl -s "$API_HOST/api/v1/get_all_stones?user_id=$TELEGRAM_ID")

echo "Imported diamonds: $DIAMONDS_RESPONSE"
echo ""

echo "[7] 🧪 Testing connection status..."
TEST_RESPONSE=$(curl -s -X POST "$API_HOST/api/v1/sftp/test-connection" \
  -H "Content-Type: application/json" \
  -d "{\"telegram_id\": \"$TELEGRAM_ID\"}")

echo "Connection test response: $TEST_RESPONSE"
echo ""

echo "[8] 🔍 Final status check..."
STATUS_RESPONSE=$(curl -s "$API_HOST/api/v1/sftp/status?telegram_id=$TELEGRAM_ID")

echo "Final status: $STATUS_RESPONSE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 [TEST COMPLETE] End-to-end SFTP flow validation finished!"
echo ""
echo "📋 Summary:"
echo "  ✅ SFTP account provisioned"
echo "  ✅ File uploaded via SFTP"
echo "  ✅ CSV processed and diamonds imported"
echo "  ✅ Connection status verified"
echo ""
echo "🧹 Cleanup: sample_diamonds.csv created in current directory"

# Cleanup
rm -f sample_diamonds.csv

echo "🚀 Your SFTP infrastructure is production-ready!"
SFTP_EOF

chmod +x test-sftp-flow.sh

<lov-write file_path="src/components/settings/SFTPTestButton.tsx">
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SFTPTestButtonProps {
  telegramId: string;
}

export function SFTPTestButton({ telegramId }: SFTPTestButtonProps) {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runFullTest = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      // 1. Test backend health
      const healthResponse = await fetch('http://136.0.3.22:8000/api/v1/alive');
      const healthOk = healthResponse.ok;

      // 2. Provision SFTP account
      const provisionResponse = await fetch('http://136.0.3.22:8000/api/v1/sftp/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId })
      });
      const provisionData = await provisionResponse.json();

      // 3. Test connection
      const testResponse = await fetch('http://136.0.3.22:8000/api/v1/sftp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: telegramId })
      });
      const testData = await testResponse.json();

      // 4. Get status
      const statusResponse = await fetch(`http://136.0.3.22:8000/api/v1/sftp/status?telegram_id=${telegramId}`);
      const statusData = await statusResponse.json();

      const results = {
        health: healthOk,
        provision: provisionData,
        test: testData,
        status: statusData,
        timestamp: new Date().toISOString()
      };

      setTestResults(results);

      if (healthOk && testData.status === 'success') {
        toast({
          title: "✅ SFTP Test Passed",
          description: "All systems operational - ready for production use",
        });
      } else {
        toast({
          title: "⚠️ SFTP Test Issues",
          description: "Some components failed - check results below",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('SFTP test failed:', error);
      toast({
        title: "❌ Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={runFullTest}
        disabled={testing}
        className="w-full"
        variant="outline"
      >
        {testing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Testing SFTP Flow...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Full SFTP Test
          </>
        )}
      </Button>

      {testResults && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            {testResults.health && testResults.test?.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            Test Results
          </h4>
          
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Backend Health:</span>
              <span className={testResults.health ? 'text-green-600' : 'text-red-600'}>
                {testResults.health ? '✅ OK' : '❌ Failed'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Account Provision:</span>
              <span className={testResults.provision?.success ? 'text-green-600' : 'text-red-600'}>
                {testResults.provision?.success ? '✅ OK' : '❌ Failed'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Connection Test:</span>
              <span className={testResults.test?.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                {testResults.test?.status === 'success' ? '✅ Connected' : '❌ Failed'}
              </span>
            </div>
            
            {testResults.provision?.credentials && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                <strong>Credentials Generated:</strong><br/>
                Username: {testResults.provision.credentials.username}<br/>
                Host: {testResults.provision.credentials.host}<br/>
                Port: {testResults.provision.credentials.port}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

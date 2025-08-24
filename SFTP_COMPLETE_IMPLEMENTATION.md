
# Complete SFTP Implementation - FastAPI Backend + React Frontend

## Overview
This is a comprehensive SFTP provisioning system for a Telegram Mini App that allows users to generate SFTP credentials, test connections, and upload diamond CSV files securely.

## Backend Architecture (FastAPI)

### API Endpoints

#### 1. Health Check
```
GET /api/v1/alive
Response: { "ok": true }
```

#### 2. SFTP Provision (One-Time Password Generation)
```
POST /api/v1/sftp/provision
Body: { "telegram_id": "2084882603" }
Response: {
  "success": true,
  "credentials": {
    "host": "136.0.3.22",
    "port": 22,
    "username": "ftp_2084882603",
    "password": "ONE_TIME_PASSWORD_SHOWN_ONCE",
    "folder_path": "/inbox"
  },
  "account": {
    "telegram_id": "2084882603",
    "ftp_username": "ftp_2084882603",
    "ftp_folder_path": "/inbox",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-02-01T00:00:00Z"
  }
}
```

#### 3. SFTP Connection Test (Polling Status)
```
POST /api/v1/sftp/test-connection
Body: { "telegram_id": "2084882603" }
Response: {
  "status": "success"|"failed"|"pending",
  "last_event": "Accepted password for ftp_2084882603"
}
```

### Backend Security Configuration

#### OpenSSH Configuration (/etc/ssh/sshd_config)
```bash
# SFTP Jail Configuration
Match Group sftpusers
    ChrootDirectory %h
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no
    PasswordAuthentication yes
    PermitTunnel no
```

#### Directory Structure
```
/ftp_uploads/                     # Root directory (755, root:root)
├── ftp_2084882603/              # User home (755, root:root)
│   ├── inbox/                   # Upload folder (755, ftp_2084882603:sftpusers)
│   ├── processed/               # Processed files (755, ftp_2084882603:sftpusers)
│   └── failed/                  # Failed files (755, ftp_2084882603:sftpusers)
```

#### User Management
```bash
# Create SFTP group
groupadd sftpusers

# Create user (done by FastAPI)
useradd -g sftpusers -d /ftp_uploads/ftp_<telegram_id> -s /bin/false ftp_<telegram_id>
passwd ftp_<telegram_id>  # Set one-time password

# Set permissions
chown root:root /ftp_uploads/ftp_<telegram_id>
chmod 755 /ftp_uploads/ftp_<telegram_id>
mkdir -p /ftp_uploads/ftp_<telegram_id>/{inbox,processed,failed}
chown ftp_<telegram_id>:sftpusers /ftp_uploads/ftp_<telegram_id>/{inbox,processed,failed}
```

## Frontend Implementation (React + TypeScript)

### 1. API Configuration (`src/lib/api/sftpConfig.ts`)
```typescript
// SFTP API Configuration
export const SFTP_CONFIG = {
  API_BASE: "http://136.0.3.22:8000",
  PREFIX: "/api/v1",
  ENDPOINTS: {
    ALIVE: "/alive",
    PROVISION: "/sftp/provision", 
    TEST_CONNECTION: "/sftp/test-connection"
  }
} as const;

export const getSftpEndpoint = (endpoint: keyof typeof SFTP_CONFIG.ENDPOINTS): string => {
  return `${SFTP_CONFIG.API_BASE}${SFTP_CONFIG.PREFIX}${SFTP_CONFIG.ENDPOINTS[endpoint]}`;
};
```

### 2. Main SFTP Component (`src/components/settings/SFTPSettings.tsx`)

#### Key Features:
- **One-Time Password Display**: Password is shown only once, then permanently hidden
- **Connection Polling**: Automatically tests SFTP connection after provisioning
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Hebrew UI**: Full RTL Hebrew interface for Telegram Mini App
- **Mobile Responsive**: Optimized for Telegram Mini App mobile experience
- **Clipboard Integration**: Copy credentials to clipboard
- **Retry Mechanism**: "Rotate & Retry" generates new credentials on failure

#### Component Structure:
```typescript
interface SFTPSettingsProps {
  onConnectionResult?: (status: "success" | "failed" | "pending", details: any) => void;
}

export function SFTPSettings({ onConnectionResult }: SFTPSettingsProps) {
  // State management
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [creds, setCreds] = useState<Provision["credentials"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(true);

  // Core functions
  async function onGenerate() { /* Provision SFTP credentials */ }
  async function pollTest() { /* Poll connection status */ }
  async function onRotateAndRetry() { /* Generate new credentials */ }
}
```

### 3. Integration in Settings Page (`src/pages/SettingsPage.tsx`)
```typescript
export default function SettingsPage() {
  const handleConnectionResult = (status: "success" | "failed" | "pending", details: any) => {
    console.log('🔔 SFTP Connection Result:', { status, details });
    
    // Wire to Telegram bot notifications
    if (status === "success") {
      // Send success notification via Telegram bot
    } else if (status === "failed") {
      // Send failure notification with retry options
    }
  };

  return (
    <TelegramLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <SFTPSettings onConnectionResult={handleConnectionResult} />
      </div>
    </TelegramLayout>
  );
}
```

## API Flow Sequence

### 1. SFTP Provision Flow
```
Frontend → POST /api/v1/sftp/provision { telegram_id: "2084882603" }
Backend → Creates Linux user ftp_2084882603
Backend → Sets up chroot jail directories
Backend → Generates one-time password
Backend → Returns credentials (PASSWORD SHOWN ONCE)
Frontend → Displays credentials with warning
Frontend → Immediately starts connection polling
```

### 2. Connection Testing Flow
```
Frontend → POST /api/v1/sftp/test-connection { telegram_id: "2084882603" }
Backend → Parses /var/log/auth.log or journalctl for SSH events
Backend → Looks for "Accepted password" or "Failed password" entries
Backend → Returns { status: "success"|"failed"|"pending", last_event: "..." }
Frontend → Polls every 1.2 seconds for up to 8 tries
Frontend → Updates UI with connection status badge
Frontend → Hides password after connection test completes
```

### 3. File Upload Flow
```
User → Uses SFTP client (FileZilla, WinSCP, etc.)
User → Connects to 136.0.3.22:22 with provided credentials
User → Uploads CSV files to /inbox directory
Backend → Monitors /inbox for new files
Backend → Processes CSV files automatically
Backend → Moves files to /processed or /failed
Backend → Sends Telegram notification when processing completes
```

## Security Features

### 1. One-Time Password Security
- Password is generated once and shown only once
- Subsequent API calls rotate the password
- Frontend never stores password in localStorage
- Password is hidden from UI after first connection test

### 2. SFTP Jail Security
- Users are locked to their home directory via chroot
- No shell access (ForceCommand internal-sftp)
- No SSH tunneling or X11 forwarding
- Limited to SFTP protocol only

### 3. Telegram Authentication
- Validates Telegram WebApp initDataUnsafe
- Extracts Telegram user ID for account creation
- Shows warning if Telegram context is unavailable

## Error Handling & User Experience

### 1. Network Errors
```typescript
// Connection test with timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 2000);

try {
  const response = await fetch(endpoint, {
    signal: controller.signal,
    mode: 'cors',
    headers: { 'Accept': 'application/json' }
  });
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    toast({
      title: "🌐 Connection Error",
      description: "Cannot reach SFTP server. Check internet connection.",
      variant: "destructive"
    });
  }
}
```

### 2. User Feedback System
```typescript
// Success states
<Badge className="bg-green-500 hover:bg-green-600">
  <CheckCircle className="h-3 w-3 mr-1" />
  מחובר
</Badge>

// Failed states  
<Badge variant="destructive">
  <AlertCircle className="h-3 w-3 mr-1" />
  נכשל
</Badge>

// Pending states
<Badge variant="secondary">
  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
  בודק חיבור...
</Badge>
```

### 3. Hebrew RTL Interface
```typescript
// Hebrew labels and instructions
<Label>שרת</Label>
<Label>פורט</Label>
<Label>שם משתמש</Label>
<Label className="flex items-center gap-2">
  <AlertCircle className="h-4 w-4 text-amber-500" />
  סיסמה (שמור בבטחה! מוצגת פעם אחת בלבד)
</Label>

// Usage instructions in Hebrew
<ul className="text-sm space-y-1 text-gray-600">
  <li>• השתמש בלקוח SFTP כמו FileZilla או WinSCP</li>
  <li>• העלה קבצי CSV לתיקיית {creds.folder_path}</li>
  <li>• הקבצים יעובדו אוטומטית תוך מספר דקות</li>
  <li>• תקבל הודעה כשהעיבוד יסתיים</li>
</ul>
```

## Test Suite

### Unit Tests (`src/components/settings/__tests__/SFTPSettings.test.tsx`)
```typescript
describe('SFTPSettings', () => {
  it('renders the SFTP settings component', () => {
    render(<SFTPSettings />);
    expect(screen.getByText('הגדרות SFTP')).toBeInTheDocument();
  });

  it('shows credentials after successful provision', async () => {
    const mockCredentials = {
      host: '136.0.3.22',
      port: 22,
      username: 'test_user',
      password: 'test_password',
      folder_path: '/inbox'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCredentials
    });

    // Test implementation...
  });
});
```

## End-to-End Testing Script

```bash
#!/usr/bin/env bash
# Complete E2E test script for SFTP implementation

# Configuration
TID="${TID:-2084882603}"
API_BASE="${API_BASE:-http://136.0.3.22:8000}"
PFX="${PFX:-/api/v1}"

# Test health endpoint
curl -sf "${API_BASE}${PFX}/alive" || die "FastAPI /alive failed"

# Test provision endpoint
RESP="$(curl -sS -X POST "${API_BASE}${PFX}/sftp/provision" \
  -H 'Content-Type: application/json' \
  -d "{\"telegram_id\":\"${TID}\"}")"

# Extract credentials
HOST="$(jq -r '.credentials.host' <<<"$RESP")"
USER="$(jq -r '.credentials.username' <<<"$RESP")"
PASS="$(jq -r '.credentials.password' <<<"$RESP")"

# Test SFTP connection
sshpass -p "$PASS" sftp -P 22 "$USER@$HOST" <<< "pwd\nls\nbye"

# Test file upload
echo "StockNo,Shape,Carat\nD001,RD,1.01" > demo.csv
sshpass -p "$PASS" sftp -P 22 "$USER@$HOST" <<< "put demo.csv /inbox/"

# Test connection status
curl -sS -X POST "${API_BASE}${PFX}/sftp/test-connection" \
  -H 'Content-Type: application/json' \
  -d "{\"telegram_id\":\"${TID}\"}"
```

## Mobile Responsiveness (Telegram Mini App)

### iPhone Optimizations
```css
/* Viewport handling for iPhone */
html {
  height: 100%;
  height: -webkit-fill-available;
}

body {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Safe area insets for iPhone */
.telegram-layout {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Touch optimizations */
button {
  min-height: 44px; /* iOS minimum touch target */
  touch-action: manipulation;
}
```

### Telegram SDK Integration
```typescript
// Enhanced Telegram WebApp integration
export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Handle viewport changes for iPhone
      tg.onEvent('viewportChanged', handleViewportChange);
      
      setWebApp(tg);
    }
  }, []);

  return webApp;
}
```

## Production Deployment Checklist

### Backend Requirements
- [ ] FastAPI server running on port 8000
- [ ] OpenSSH server configured with SFTP jail
- [ ] Group `sftpusers` created
- [ ] Directory `/ftp_uploads` created with correct permissions
- [ ] CORS configured for frontend domain
- [ ] SSL/TLS certificate for HTTPS (recommended)

### Frontend Requirements  
- [ ] API_BASE_URL updated in sftpConfig.ts
- [ ] Telegram Bot token configured for notifications
- [ ] Mobile viewport meta tags configured
- [ ] PWA manifest for Telegram Mini App
- [ ] Error boundary implemented

### Security Checklist
- [ ] One-time password implementation verified
- [ ] SFTP chroot jail tested
- [ ] File upload limits configured
- [ ] Rate limiting on API endpoints
- [ ] Telegram hash validation implemented
- [ ] HTTPS enforced in production

This complete implementation provides a secure, user-friendly SFTP provisioning system integrated with Telegram Mini App, featuring one-time password security, comprehensive error handling, and mobile-optimized UI.

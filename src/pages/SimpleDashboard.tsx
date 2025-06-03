
import { useState, useEffect } from 'react';

// Ultra-minimal user context
const useMinimalAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Minimal auth initialization...');
    
    try {
      // Quick user setup
      const defaultUser = {
        id: 2138564172,
        first_name: "or",
        last_name: "",
        username: "ormoshe"
      };

      // Check for Telegram data in URL
      if (typeof window !== 'undefined' && window.location.hash) {
        try {
          const hash = window.location.hash;
          if (hash.includes('tgWebAppData')) {
            const urlParams = new URLSearchParams(hash.split('?')[1] || hash.substring(1));
            const tgData = urlParams.get('tgWebAppData');
            
            if (tgData) {
              const decodedData = decodeURIComponent(tgData);
              const userMatch = decodedData.match(/user=([^&]+)/);
              
              if (userMatch) {
                const userData = JSON.parse(decodeURIComponent(userMatch[1]));
                console.log('✅ Found Telegram user data:', userData);
                setUser(userData);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Failed to parse Telegram data:', e);
        }
      }

      // Fallback to default user
      setUser(defaultUser);
      setLoading(false);
      console.log('✅ Using default user');
    } catch (error) {
      console.error('Auth error:', error);
      setUser({ id: 999999, first_name: "User", last_name: "" });
      setLoading(false);
    }
  }, []);

  return { user, loading };
};

export default function SimpleDashboard() {
  const { user, loading } = useMinimalAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <div>Initializing Diamond Muzzle...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 2rem',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💎</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Diamond Muzzle</h1>
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Welcome, {user?.first_name || 'User'}!
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Welcome to Diamond Muzzle
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2rem' }}>
            Your professional diamond management platform
          </p>
          <div style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '25px',
            fontSize: '0.875rem',
            backdropFilter: 'blur(10px)'
          }}>
            ✅ System Online & Ready
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {[
            { icon: '💎', title: 'Inventory', value: 'Ready', subtitle: 'Manage your diamonds' },
            { icon: '📊', title: 'Analytics', value: 'Active', subtitle: 'Track performance' },
            { icon: '💰', title: 'Portfolio', value: 'Growing', subtitle: 'Monitor value' },
            { icon: '🎯', title: 'Leads', value: 'Active', subtitle: 'Manage prospects' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {stat.title}
              </h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: '📦', text: 'View Inventory' },
              { icon: '📤', text: 'Upload Data' },
              { icon: '📈', text: 'View Reports' },
              { icon: '⚙️', text: 'Settings' }
            ].map((action, index) => (
              <button
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0px)';
                }}
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Badge */}
        {user?.id === 2138564172 && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            borderRadius: '25px',
            fontSize: '0.75rem',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            👑 ADMIN ACCESS
          </div>
        )}
      </main>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

// Enhanced environment variable validation for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Comprehensive validation with local development awareness
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
  console.error('📋 Add VITE_SUPABASE_URL=http://127.0.0.1:54321 to your .env file');
  console.error('💡 Note: Vite requires VITE_ prefix for client-side access');
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  console.error('📋 Add VITE_SUPABASE_ANON_KEY=your_anon_key to your .env file');
  console.error('💡 Note: Vite requires VITE_ prefix for client-side access');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Detect local vs production environment
const isLocalDevelopment = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');

if (isLocalDevelopment) {
  console.log('🏠 Local Supabase development environment detected');
  console.log('🔗 Supabase URL:', supabaseUrl);
} else {
  // Validate production URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('❌ Invalid Supabase URL format for production:', supabaseUrl);
    console.error('📋 Production URL should be: https://your-project.supabase.co');
    throw new Error('Invalid VITE_SUPABASE_URL format for production');
  }
  console.log('☁️ Production Supabase environment detected');
  console.log('🔗 Supabase URL:', supabaseUrl);
}

// Basic key validation
if (supabaseAnonKey.length < 50) {
  console.error('❌ Supabase anon key appears to be invalid (too short)');
  console.error('📋 Key should be a JWT token starting with eyJ...');
  throw new Error('Invalid VITE_SUPABASE_ANON_KEY format');
}

console.log('✅ Environment variables validated successfully');
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

// FIXED: Enhanced WebSocket transport configuration for local development
const realtimeConfig = {
  params: {
    eventsPerSecond: 10,
  },
  // Fix transport configuration for browser compatibility
  ...(isLocalDevelopment ? {
    // For local development, use minimal config to avoid transport errors
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: () => Math.random() * 5000 + 1000,
  } : {
    // Production configuration
    transport: 'websocket',
    timeout: 20000,
  })
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: realtimeConfig,
  global: {
    headers: {
      'x-application-name': 'momentum-gym-app',
      'x-environment': isLocalDevelopment ? 'development' : 'production'
    }
  }
});

console.log('🔧 Supabase client initialized successfully with enhanced WebSocket config');

// FIXED: Safe realtime monitoring with proper error handling
let realtimeChannel = null;
let monitoringRetries = 0;
const MAX_MONITORING_RETRIES = 3;

// Initialize realtime connection monitoring with retry logic
const initializeRealtimeMonitoring = async () => {
  if (monitoringRetries >= MAX_MONITORING_RETRIES) {
    console.warn('⚠️ Max realtime monitoring retries reached, skipping for stability');
    return;
  }

  try {
    console.log(`📡 Initializing realtime monitoring (attempt ${monitoringRetries + 1}/${MAX_MONITORING_RETRIES})`);
    
    // Wait a moment for supabase client to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a simple monitoring channel
    realtimeChannel = supabase.channel(`system-status-${Date.now()}`);
    
    // Subscribe with enhanced error handling
    const subscription = realtimeChannel.subscribe((status, err) => {
      if (err) {
        console.warn('⚠️ Realtime subscription error:', err.message);
        return;
      }
      
      switch (status) {
        case 'SUBSCRIBED':
          console.log('✅ Supabase realtime connected successfully');
          monitoringRetries = 0; // Reset retry counter on success
          break;
        case 'CHANNEL_ERROR':
          console.warn('⚠️ Supabase realtime channel error (will retry)');
          scheduleRealtimeRetry();
          break;
        case 'TIMED_OUT':
          console.warn('⏰ Supabase realtime connection timed out');
          scheduleRealtimeRetry();
          break;
        case 'CLOSED':
          console.log('🔌 Supabase realtime connection closed');
          break;
        default:
          console.log('📡 Supabase realtime status:', status);
      }
    });
    
  } catch (error) {
    console.warn(`⚠️ Realtime monitoring setup failed (attempt ${monitoringRetries + 1}):`, error.message);
    scheduleRealtimeRetry();
  }
};

// Schedule retry for realtime monitoring
const scheduleRealtimeRetry = () => {
  monitoringRetries++;
  if (monitoringRetries < MAX_MONITORING_RETRIES) {
    console.log(`🔄 Scheduling realtime retry in ${monitoringRetries * 2} seconds...`);
    setTimeout(initializeRealtimeMonitoring, monitoringRetries * 2000);
  }
};

// Initialize realtime monitoring with delay
setTimeout(initializeRealtimeMonitoring, 2000);

// ENHANCED: Realtime utilities with better error handling
export function getRealtimeStatus() {
  try {
    if (!realtimeChannel) {
      return 'NOT_INITIALIZED';
    }
    return realtimeChannel.state || 'UNKNOWN';
  } catch (error) {
    console.warn('⚠️ Error getting realtime status:', error.message);
    return 'ERROR';
  }
}

export function createRealtimeChannel(channelName, options = {}) {
  try {
    // Add random suffix to avoid channel name conflicts
    const uniqueChannelName = `${channelName}-${Date.now()}`;
    
    console.log(`📺 Creating realtime channel: ${uniqueChannelName}`);
    
    const channel = supabase.channel(uniqueChannelName, {
      // Enhanced channel configuration for stability
      config: {
        broadcast: { self: true },
        presence: { key: '' },
        ...options.config
      },
      ...options
    });
    
    console.log(`✅ Created realtime channel: ${uniqueChannelName}`);
    return channel;
  } catch (error) {
    console.warn(`⚠️ Failed to create realtime channel ${channelName}:`, error.message);
    return null;
  }
}

export function removeRealtimeChannel(channel) {
  try {
    if (channel && supabase.removeChannel) {
      supabase.removeChannel(channel);
      console.log('📺 Realtime channel removed successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('⚠️ Failed to remove realtime channel:', error.message);
    return false;
  }
}

// Utility functions
export async function getPublicUsers() {
  try {
    const { data, error } = await supabase
      .from('users') 
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error in getPublicUsers:', err);
    return [];
  }
}

export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test with a simple query that should work in both local and production
    const { data, error } = await supabase
      .from('general_settings')
      .select('count')
      .limit(1);
    
    console.log('📊 Connection test result:', { data, error });
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      // For local development, try alternative test
      if (isLocalDevelopment) {
        console.log('🔄 Trying alternative connection test for local environment...');
        const { error: healthError } = await supabase.from('general_settings').select('*').limit(1);
        return !healthError;
      }
      return false;
    }
    
    console.log('✅ Supabase connection confirmed');
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// ENHANCED: Database health check utility
export async function checkDatabaseHealth() {
  try {
    const results = await Promise.allSettled([
      // Test critical tables
      supabase.from('general_settings').select('count').limit(1),
      supabase.from('profiles').select('count').limit(1)
    ]);
    
    const healthReport = {
      settings: results[0].status === 'fulfilled' && !results[0].value.error,
      profiles: results[1].status === 'fulfilled' && !results[1].value.error,
      overall: results.every(r => r.status === 'fulfilled' && !r.value.error),
      realtime: getRealtimeStatus(),
      realtimeRetries: monitoringRetries
    };
    
    console.log('🏥 Database health check:', healthReport);
    return healthReport;
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {
      settings: false,
      profiles: false,
      overall: false,
      realtime: 'ERROR',
      realtimeRetries: monitoringRetries,
      error: error.message
    };
  }
}

// Initialize connection test (non-blocking)
(async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('🚀 Application ready for database operations');
      
      // Run health check after successful connection
      setTimeout(async () => {
        await checkDatabaseHealth();
      }, 5000);
    } else {
      console.warn('⚠️ Database connection issues detected - some features may not work');
    }
  } catch (error) {
    console.error('❌ Startup connection test failed:', error);
  }
})();

// Enhanced cleanup function for graceful shutdown
export function cleanup() {
  try {
    if (realtimeChannel) {
      removeRealtimeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    monitoringRetries = 0;
    console.log('🧹 Supabase client cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Register cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}



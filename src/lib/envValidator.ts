/**
 * Environment validator — checks required variables at startup.
 * Never logs actual values — only FOUND / MISSING.
 */

const REQUIRED_PUBLIC_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

interface EnvStatus {
  variable: string;
  status: 'FOUND' | 'MISSING' | 'EMPTY';
}

export function validateEnvironment(): { valid: boolean; statuses: EnvStatus[] } {
  const statuses: EnvStatus[] = [];
  let valid = true;

  for (const key of REQUIRED_PUBLIC_VARS) {
    const value = import.meta.env[key];
    if (!value) {
      statuses.push({ variable: key, status: 'MISSING' });
      valid = false;
    } else if (value === 'paste_your_anon_key_here' || value === 'YOUR_KEY_HERE') {
      statuses.push({ variable: key, status: 'EMPTY' });
      valid = false;
    } else {
      statuses.push({ variable: key, status: 'FOUND' });
    }
  }

  // Log status (never log actual values)
  if (import.meta.env.DEV) {
    console.group('%c[Study Hub] Environment Check', 'color: #5CE1E6; font-weight: bold;');
    for (const s of statuses) {
      const icon = s.status === 'FOUND' ? '✅' : '❌';
      console.log(`${icon} ${s.variable}: ${s.status}`);
    }
    console.log(`Environment: ${import.meta.env.MODE}`);
    console.groupEnd();
  }

  if (!valid) {
    const missing = statuses.filter(s => s.status !== 'FOUND').map(s => s.variable);
    console.error(
      `[Study Hub] Missing or invalid environment variables: ${missing.join(', ')}. ` +
      'Check your .env file against .env.example.'
    );
  }

  return { valid, statuses };
}

/**
 * Get current environment name for display.
 * Never exposes actual env var values.
 */
export function getEnvironmentName(): 'development' | 'staging' | 'production' | 'test' {
  const mode = import.meta.env.MODE;
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  if (mode === 'test') return 'test';
  return 'development';
}

/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are present
 * and properly configured before the application starts.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'POSTGRES_URL_NON_POOLING',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

// Optional environment variables for reference
// const optionalEnvVars = ['APP_URL', 'NODE_ENV'] as const

interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Validates environment variables and throws if any required vars are missing
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check for weak secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXTAUTH_SECRET === 'your-secret-key-change-this-in-production') {
      warnings.push('NEXTAUTH_SECRET is using default value - please change in production!')
    }

    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      warnings.push('NEXTAUTH_SECRET should be at least 32 characters for security')
    }
  }

  // Check database URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    warnings.push('DATABASE_URL should start with postgresql://')
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validates environment and throws descriptive error if invalid
 */
export function requireValidEnv(): void {
  const result = validateEnv()

  if (!result.valid) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      '',
      ...result.missing.map(v => `  - ${v}`),
      '',
      'Please create a .env file with all required variables.',
      'See .env.example for reference.',
    ].join('\n')

    throw new Error(errorMessage)
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment warnings:')
    result.warnings.forEach(w => console.warn(`  - ${w}`))
    console.warn('')
  }
}

/**
 * Gets a required environment variable or throws
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

/**
 * Gets an optional environment variable with default
 */
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

// Run validation on import (server-side only)
if (typeof window === 'undefined') {
  try {
    requireValidEnv()
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(error)
      process.exit(1)
    }
  }
}

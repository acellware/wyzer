import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // Database
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().min(1).optional(),

  // JWT — RS256 keys (required in non-dev environments)
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Wyzer <noreply@wyzer.dev>'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  /// Stripe Price IDs for the Pro and Team plans
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_TEAM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the Zod schema.
 * Called by @nestjs/config's validate option on startup.
 * Throws if required variables are missing or invalid.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(
      `Environment variable validation failed:\n${JSON.stringify(formatted, null, 2)}`,
    );
  }

  return result.data;
}

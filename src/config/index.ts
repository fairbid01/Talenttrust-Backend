/**
 * Centralized application configuration.
 *
 * Loads, validates, and exports a typed configuration object built from
 * environment variables. All values are validated at startup so
 * misconfigurations surface immediately rather than at runtime.
 * @module
 */

import { optionalEnv, parseIntEnv } from './env';

/** Server configuration. */
export interface ServerConfig {
  /** HTTP port for the Express server. */
  port: number;
  /** Current runtime environment (e.g. "development", "production"). */
  nodeEnv: string;
  /** Convenience flag: true when NODE_ENV is "production". */
  isProduction: boolean;
}

/** Stellar network configuration. */
export interface StellarConfig {
  /** Horizon API endpoint URL. */
  horizonUrl: string;
  /** Network passphrase used for transaction signing. */
  networkPassphrase: string;
}

/** Soroban smart contract configuration. */
export interface SorobanConfig {
  /** Soroban JSON-RPC endpoint URL. */
  rpcUrl: string;
  /** Deployed escrow contract ID (empty until a contract is deployed). */
  contractId: string;
}

/** Complete application configuration. */
export interface AppConfig {
  server: ServerConfig;
  stellar: StellarConfig;
  soroban: SorobanConfig;
}

/** Default Stellar testnet Horizon URL. */
const STELLAR_TESTNET_HORIZON = 'https://horizon-testnet.stellar.org';

/** Default Stellar testnet network passphrase. */
const STELLAR_TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

/** Default Soroban testnet RPC URL. */
const SOROBAN_TESTNET_RPC = 'https://soroban-testnet.stellar.org';

/**
 * Loads and validates the application configuration from environment
 * variables. Call this function to create a fresh config snapshot — useful
 * in tests where environment variables change between runs.
 *
 * @returns A frozen, deeply-immutable AppConfig object
 * @throws {Error} If any required variable is missing or a value fails validation
 */
export function loadConfig(): AppConfig {
  const nodeEnv = optionalEnv('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  return Object.freeze({
    server: Object.freeze({
      port: parseIntEnv('PORT', 3001),
      nodeEnv,
      isProduction,
    }),
    stellar: Object.freeze({
      horizonUrl: optionalEnv('STELLAR_HORIZON_URL', STELLAR_TESTNET_HORIZON),
      networkPassphrase: optionalEnv(
        'STELLAR_NETWORK_PASSPHRASE',
        STELLAR_TESTNET_PASSPHRASE,
      ),
    }),
    soroban: Object.freeze({
      rpcUrl: optionalEnv('SOROBAN_RPC_URL', SOROBAN_TESTNET_RPC),
      contractId: optionalEnv('SOROBAN_CONTRACT_ID', ''),
    }),
  });
}

/** Application configuration singleton, loaded once at startup. */
export const config: AppConfig = loadConfig();

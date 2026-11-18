import { Operator } from './billiards';

/**
 * Credentials submitted during operator authentication.
 */
export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * Authenticated session payload returned by an auth provider.
 */
export interface AuthSession {
  operator: Operator;
  authenticatedAt: string;
}

/**
 * Contract for authentication providers (hardcoded mock now, Supabase Auth later).
 */
export interface IAuthService {
  login(username: string, password: string): Promise<AuthSession>;
}

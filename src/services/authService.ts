import { OPERATORS } from '../data/mockData';
import { AuthSession, IAuthService } from '../types/auth';

const ADMIN_OPERATOR = {
  ...(OPERATORS[0] ?? {
    id: 'op-admin',
    shift: 'Turno Tarde',
  }),
  id: 'op-admin',
  name: 'Admin',
  shortName: 'Admin',
  email: 'admin@crashmanager.com',
  role: 'Administrador',
  initials: 'AD',
};

/**
 * Temporary mock authentication service.
 * Designed behind IAuthService so Supabase Auth can replace its internals
 * without modifying UI components.
 */
export class AuthService implements IAuthService {
  async login(username: string, password: string): Promise<AuthSession> {
    if (!username.trim() || !password.trim()) {
      throw new Error('completar los datos');
    }

    if (username.trim() === 'admin' && password === '123') {
      return {
        operator: ADMIN_OPERATOR,
        authenticatedAt: new Date().toISOString(),
      };
    }

    throw new Error('Usuario/contraseña no válidos');
  }
}

export const authService: IAuthService = new AuthService();

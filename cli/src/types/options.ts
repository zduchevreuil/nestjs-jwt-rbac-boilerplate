export interface ProjectOptions {
  projectName: string;
  template: 'full' | 'minimal' | 'api-only';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  database: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  orm: 'prisma' | 'typeorm' | 'mongoose';
  authMethods: AuthMethod[];
  oauthProviders: OAuthProvider[];
  enableTwoFactor: boolean;
  enableRedis: boolean;
  includeTests: boolean;
  skipInstall: boolean;
  skipGit: boolean;
  corsOrigin: string;
}

export type AuthMethod = 'jwt' | 'oauth' | 'api-key';
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter';

export interface TemplateContext {
  projectName: string;
  projectNamePascal: string;
  projectNameKebab: string;
  database: string;
  databaseUrl: string;
  orm: string;
  hasJwt: boolean;
  hasOAuth: boolean;
  hasApiKey: boolean;
  oauthProviders: OAuthProvider[];
  enableTwoFactor: boolean;
  enableRedis: boolean;
  corsOrigin: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
}

export interface DependencyConfig {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

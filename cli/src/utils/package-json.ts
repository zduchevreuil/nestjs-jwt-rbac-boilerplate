import { ProjectOptions, DependencyConfig } from '../types/options';

export function generateDependencies(options: ProjectOptions): DependencyConfig {
  const baseDependencies: Record<string, string> = {
    '@nestjs/common': '^11.0.1',
    '@nestjs/config': '^4.0.2',
    '@nestjs/core': '^11.0.1',
    '@nestjs/jwt': '^11.0.1',
    '@nestjs/mapped-types': '*',
    '@nestjs/platform-express': '^11.0.1',
    '@nestjs/schedule': '^6.0.1',
    '@nestjs/terminus': '^11.0.0',
    '@nestjs/throttler': '^6.4.0',
    'bcrypt': '^6.0.0',
    'class-transformer': '^0.5.1',
    'class-validator': '^0.14.2',
    'cookie-parser': '^1.4.7',
    'dotenv': '^17.2.3',
    'helmet': '^8.1.0',
    'nestjs-pino': '^4.4.1',
    'pino-http': '^10.5.0',
    'pino-pretty': '^13.1.2',
    'reflect-metadata': '^0.2.2',
    'rxjs': '^7.8.1',
    'zod': '^4.1.12',
  };

  const baseDevDependencies: Record<string, string> = {
    '@eslint/eslintrc': '^3.2.0',
    '@eslint/js': '^9.18.0',
    '@nestjs/cli': '^11.0.0',
    '@nestjs/schematics': '^11.0.0',
    '@types/bcrypt': '^6.0.0',
    '@types/cookie-parser': '^1.4.10',
    '@types/express': '^5.0.0',
    '@types/node': '^22.10.7',
    'eslint': '^9.18.0',
    'eslint-config-prettier': '^10.0.1',
    'eslint-plugin-prettier': '^5.2.2',
    'globals': '^16.0.0',
    'prettier': '^3.4.2',
    'source-map-support': '^0.5.21',
    'ts-loader': '^9.5.2',
    'ts-node': '^10.9.2',
    'tsconfig-paths': '^4.2.0',
    'typescript': '^5.7.3',
    'typescript-eslint': '^8.20.0',
  };

  // Add ORM-specific dependencies
  if (options.orm === 'prisma') {
    baseDependencies['@prisma/client'] = '^6.19.0';
    baseDevDependencies['prisma'] = '^6.19.0';
  } else if (options.orm === 'typeorm') {
    baseDependencies['@nestjs/typeorm'] = '^11.0.2';
    baseDependencies['typeorm'] = '^0.3.20';
    
    // Database drivers for TypeORM
    if (options.database === 'postgresql') {
      baseDependencies['pg'] = '^8.13.1';
    } else if (options.database === 'mysql') {
      baseDependencies['mysql2'] = '^3.11.5';
    } else if (options.database === 'sqlite') {
      baseDependencies['better-sqlite3'] = '^11.7.0';
    }
  } else if (options.orm === 'mongoose') {
    baseDependencies['@nestjs/mongoose'] = '^11.0.2';
    baseDependencies['mongoose'] = '^8.9.3';
  }

  // Add OAuth dependencies
  if (options.authMethods.includes('oauth')) {
    baseDependencies['@nestjs/passport'] = '^11.0.0';
    baseDependencies['passport'] = '^0.7.0';
    baseDependencies['passport-jwt'] = '^4.0.1';
    baseDevDependencies['@types/passport'] = '^1.0.18';
    baseDevDependencies['@types/passport-jwt'] = '^4.0.1';

    options.oauthProviders.forEach((provider) => {
      if (provider === 'google') {
        baseDependencies['passport-google-oauth20'] = '^2.0.0';
        baseDevDependencies['@types/passport-google-oauth20'] = '^2.0.19';
      } else if (provider === 'github') {
        baseDependencies['passport-github2'] = '^0.1.12';
        baseDevDependencies['@types/passport-github2'] = '^1.2.12';
      } else if (provider === 'facebook') {
        baseDependencies['passport-facebook'] = '^3.0.0';
        baseDevDependencies['@types/passport-facebook'] = '^3.0.3';
      } else if (provider === 'twitter') {
        baseDependencies['passport-twitter'] = '^1.0.4';
        baseDevDependencies['@types/passport-twitter'] = '^1.0.40';
      }
    });
  }

  // Add 2FA dependencies
  if (options.enableTwoFactor) {
    baseDependencies['speakeasy'] = '^2.0.0';
    baseDependencies['qrcode'] = '^1.5.4';
    baseDevDependencies['@types/speakeasy'] = '^2.0.10';
    baseDevDependencies['@types/qrcode'] = '^1.5.5';
  }

  // Add Redis dependencies
  if (options.enableRedis) {
    baseDependencies['@nestjs/cache-manager'] = '^2.3.0';
    baseDependencies['cache-manager'] = '^5.7.6';
    baseDependencies['cache-manager-redis-store'] = '^3.0.1';
    baseDependencies['redis'] = '^4.7.0';
  }

  // Add phone number validation
  baseDependencies['libphonenumber-js'] = '^1.12.26';

  // Add test dependencies
  if (options.includeTests) {
    baseDevDependencies['@nestjs/testing'] = '^11.0.1';
    baseDevDependencies['@types/jest'] = '^30.0.0';
    baseDevDependencies['@types/supertest'] = '^6.0.2';
    baseDevDependencies['jest'] = '^30.0.0';
    baseDevDependencies['supertest'] = '^7.0.0';
    baseDevDependencies['ts-jest'] = '^29.2.5';
  }

  return {
    dependencies: baseDependencies,
    devDependencies: baseDevDependencies,
  };
}

export function generatePackageJson(options: ProjectOptions, deps: DependencyConfig) {
  const scripts: Record<string, string> = {
    build: 'nest build',
    format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
    start: 'nest start',
    'start:dev': 'nest start --watch',
    'start:debug': 'nest start --debug --watch',
    'start:prod': 'node dist/main',
    lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
  };

  if (options.includeTests) {
    scripts.test = 'jest';
    scripts['test:watch'] = 'jest --watch';
    scripts['test:cov'] = 'jest --coverage';
    scripts['test:debug'] = 'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand';
    scripts['test:e2e'] = 'jest --config ./test/jest-e2e.json';
  }

  if (options.orm === 'prisma') {
    scripts['prisma:generate'] = 'prisma generate';
    scripts['prisma:migrate'] = 'prisma migrate dev';
    scripts['prisma:migrate:create'] = 'prisma migrate dev --create-only';
    scripts['prisma:migrate:deploy'] = 'prisma migrate deploy';
    scripts['prisma:migrate:status'] = 'prisma migrate status';
    scripts['prisma:seed'] = 'ts-node prisma/seed.ts';
    scripts['prisma:studio'] = 'prisma studio';
    scripts['prisma:reset'] = 'prisma migrate reset --force';
  }

  const packageJson = {
    name: options.projectName,
    version: '0.0.1',
    description: 'Production-ready NestJS authentication system with JWT, refresh tokens, and RBAC',
    author: '',
    private: true,
    license: 'MIT',
    scripts,
    dependencies: deps.dependencies,
    devDependencies: deps.devDependencies,
    jest: options.includeTests
      ? {
          moduleFileExtensions: ['js', 'json', 'ts'],
          rootDir: 'src',
          testRegex: '.*\\.spec\\.ts$',
          transform: {
            '^.+\\.(t|j)s$': 'ts-jest',
          },
          collectCoverageFrom: ['**/*.(t|j)s'],
          coverageDirectory: '../coverage',
          testEnvironment: 'node',
        }
      : undefined,
  };

  if (options.orm === 'prisma') {
    (packageJson as any).prisma = {
      seed: 'ts-node prisma/seed.ts',
    };
  }

  return packageJson;
}

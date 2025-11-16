import { prompt } from 'enquirer';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';
import { ProjectOptions, AuthMethod, OAuthProvider } from '../types/options';

export async function promptForOptions(
  projectName?: string,
  cliOptions?: Partial<ProjectOptions>,
  useDefaults?: boolean
): Promise<ProjectOptions> {
  if (useDefaults) {
    return {
      projectName: projectName || 'my-nestjs-auth-app',
      template: 'full',
      packageManager: 'npm',
      database: 'postgresql',
      orm: 'prisma',
      authMethods: ['jwt', 'oauth'],
      oauthProviders: ['google', 'github'],
      enableTwoFactor: false,
      enableRedis: false,
      includeTests: true,
      skipInstall: false,
      skipGit: false,
      corsOrigin: 'http://localhost:3000',
    };
  }

  const answers: any = {};

  // Project Name
  if (!projectName) {
    const nameAnswer = await prompt<{ projectName: string }>({
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-nestjs-auth-app',
      validate: (value: string) => {
        const result = validatePackageName(value);
        if (!result.validForNewPackages) {
          return result.errors?.[0] || 'Invalid package name';
        }
        return true;
      },
    });
    answers.projectName = nameAnswer.projectName;
  } else {
    answers.projectName = projectName;
  }

  // Template Selection
  const templateAnswer = await prompt<{ template: 'full' | 'minimal' | 'api-only' }>({
    type: 'select',
    name: 'template',
    message: 'Choose your template:',
    initial: 0,
    choices: [
      {
        name: 'full',
        message: '🎯 Full - Complete auth with all features (JWT, OAuth, RBAC, 2FA)',
        hint: 'Recommended for most projects',
      },
      {
        name: 'minimal',
        message: '⚡ Minimal - Basic JWT auth with RBAC',
        hint: 'Lightweight, no OAuth',
      },
      {
        name: 'api-only',
        message: '🔑 API-Only - JWT + API key authentication',
        hint: 'For backend services',
      },
    ],
  });
  answers.template = cliOptions?.template || templateAnswer.template;

  // Database Selection
  const databaseAnswer = await prompt<{ database: string }>({
    type: 'select',
    name: 'database',
    message: 'Choose your database:',
    initial: 0,
    choices: [
      { name: 'postgresql', message: '🐘 PostgreSQL (Recommended)', hint: 'Most production apps' },
      { name: 'mysql', message: '🐬 MySQL/MariaDB', hint: 'Alternative RDBMS' },
      { name: 'sqlite', message: '🪶 SQLite', hint: 'Development/testing' },
      { name: 'mongodb', message: '🍃 MongoDB', hint: 'NoSQL option' },
    ],
  });
  answers.database = cliOptions?.database || databaseAnswer.database;

  // ORM Selection (conditional on database)
  if (answers.database === 'mongodb') {
    answers.orm = 'mongoose';
  } else {
    const ormAnswer = await prompt<{ orm: string }>({
      type: 'select',
      name: 'orm',
      message: 'Choose your ORM:',
      initial: 0,
      choices: [
        { name: 'prisma', message: '⚡ Prisma (Recommended)', hint: 'Modern, type-safe' },
        { name: 'typeorm', message: '🔧 TypeORM', hint: 'Feature-rich, mature' },
      ],
    });
    answers.orm = cliOptions?.orm || ormAnswer.orm;
  }

  // Authentication Methods
  if (answers.template !== 'api-only') {
    const authMethodsAnswer = await prompt<{ authMethods: AuthMethod[] }>({
      type: 'multiselect',
      name: 'authMethods',
      message: 'Select authentication methods:',
      initial: [0, 1],
      choices: [
        { name: 'jwt', message: '🔐 JWT (Access + Refresh Tokens)', enabled: true },
        { name: 'oauth', message: '🌐 OAuth2 (Social Login)', enabled: false },
        { name: 'api-key', message: '🔑 API Key Authentication', enabled: false },
      ],
    });
    answers.authMethods = authMethodsAnswer.authMethods;

    // OAuth Providers (conditional)
    if (answers.authMethods.includes('oauth')) {
      const oauthAnswer = await prompt<{ oauthProviders: OAuthProvider[] }>({
        type: 'multiselect',
        name: 'oauthProviders',
        message: 'Select OAuth providers:',
        choices: [
          { name: 'google', message: '🔍 Google', enabled: true },
          { name: 'github', message: '🐙 GitHub', enabled: true },
          { name: 'facebook', message: '👤 Facebook', enabled: false },
          { name: 'twitter', message: '🐦 Twitter/X', enabled: false },
        ],
      });
      answers.oauthProviders = oauthAnswer.oauthProviders;
    } else {
      answers.oauthProviders = [];
    }
  } else {
    answers.authMethods = ['jwt', 'api-key'];
    answers.oauthProviders = [];
  }

  // Two-Factor Authentication
  if (answers.template === 'full') {
    const twoFactorAnswer = await prompt<{ enableTwoFactor: boolean }>({
      type: 'confirm',
      name: 'enableTwoFactor',
      message: 'Enable Two-Factor Authentication (2FA)?',
      initial: false,
      hint: 'TOTP-based (Google Authenticator)',
    });
    answers.enableTwoFactor = twoFactorAnswer.enableTwoFactor;
  } else {
    answers.enableTwoFactor = false;
  }

  // Redis for Sessions
  const redisAnswer = await prompt<{ enableRedis: boolean }>({
    type: 'confirm',
    name: 'enableRedis',
    message: 'Add Redis for session management?',
    initial: false,
    hint: 'Improves scalability, requires Docker',
  });
  answers.enableRedis = redisAnswer.enableRedis;

  // Package Manager
  const packageManagerAnswer = await prompt<{ packageManager: 'npm' | 'yarn' | 'pnpm' }>({
    type: 'select',
    name: 'packageManager',
    message: 'Choose package manager:',
    initial: 0,
    choices: [
      { name: 'npm', message: '📦 npm' },
      { name: 'yarn', message: '🧶 Yarn' },
      { name: 'pnpm', message: '⚡ pnpm (Fast)' },
    ],
  });
  answers.packageManager = cliOptions?.packageManager || packageManagerAnswer.packageManager;

  // Include Tests
  const testsAnswer = await prompt<{ includeTests: boolean }>({
    type: 'confirm',
    name: 'includeTests',
    message: 'Include example tests (Jest + E2E)?',
    initial: true,
  });
  answers.includeTests = testsAnswer.includeTests;

  // CORS Origin
  const corsAnswer = await prompt<{ corsOrigin: string }>({
    type: 'input',
    name: 'corsOrigin',
    message: 'Enter CORS origin (frontend URL):',
    initial: 'http://localhost:3000',
    hint: 'Comma-separated for multiple: http://localhost:3000,https://example.com',
  });
  answers.corsOrigin = corsAnswer.corsOrigin;

  // Install Dependencies
  const installAnswer = await prompt<{ install: boolean }>({
    type: 'confirm',
    name: 'install',
    message: `Install dependencies with ${answers.packageManager}?`,
    initial: true,
    hint: 'Estimated time: 2-3 minutes',
  });
  answers.skipInstall = !installAnswer.install;

  // Git Initialization
  const gitAnswer = await prompt<{ initGit: boolean }>({
    type: 'confirm',
    name: 'initGit',
    message: 'Initialize git repository?',
    initial: true,
  });
  answers.skipGit = !gitAnswer.initGit;

  console.log(chalk.cyan('\n📊 Configuration Summary:\n'));
  console.log(chalk.white(`  Project: ${chalk.yellow(answers.projectName)}`));
  console.log(chalk.white(`  Template: ${chalk.yellow(answers.template)}`));
  console.log(chalk.white(`  Database: ${chalk.yellow(answers.database)} with ${chalk.yellow(answers.orm)}`));
  console.log(chalk.white(`  Auth: ${chalk.yellow(answers.authMethods.join(', '))}`));
  if (answers.oauthProviders.length > 0) {
    console.log(chalk.white(`  OAuth: ${chalk.yellow(answers.oauthProviders.join(', '))}`));
  }
  console.log();

  const confirmAnswer = await prompt<{ confirm: boolean }>({
    type: 'confirm',
    name: 'confirm',
    message: 'Proceed with this configuration?',
    initial: true,
  });

  if (!confirmAnswer.confirm) {
    console.log(chalk.red('\n❌ Cancelled by user'));
    process.exit(0);
  }

  return answers as ProjectOptions;
}

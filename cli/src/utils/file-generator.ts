import * as path from 'path';
import * as fs from 'fs-extra';
import * as ejs from 'ejs';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectOptions, TemplateContext } from '../types/options';
import { toPascalCase, toKebabCase, getDatabaseUrl, generateRandomSecret } from './validator';

export class FileGenerator {
  private templateDir: string;
  private targetDir: string;
  private options: ProjectOptions;
  private context: TemplateContext;

  constructor(templateDir: string, targetDir: string, options: ProjectOptions) {
    this.templateDir = templateDir;
    this.targetDir = targetDir;
    this.options = options;
    this.context = this.createTemplateContext();
  }

  private createTemplateContext(): TemplateContext {
    return {
      projectName: this.options.projectName,
      projectNamePascal: toPascalCase(this.options.projectName),
      projectNameKebab: toKebabCase(this.options.projectName),
      database: this.options.database,
      databaseUrl: getDatabaseUrl(this.options.database, this.options.projectName),
      orm: this.options.orm,
      hasJwt: this.options.authMethods.includes('jwt'),
      hasOAuth: this.options.authMethods.includes('oauth'),
      hasApiKey: this.options.authMethods.includes('api-key'),
      oauthProviders: this.options.oauthProviders,
      enableTwoFactor: this.options.enableTwoFactor,
      enableRedis: this.options.enableRedis,
      corsOrigin: this.options.corsOrigin,
      jwtAccessExpiry: '60m',
      jwtRefreshExpiry: '30d',
    };
  }

  async generateFiles(): Promise<void> {
    const spinner = ora('Creating project structure...').start();

    try {
      // Create target directory
      await fs.ensureDir(this.targetDir);

      // Copy and process template files
      await this.copyTemplateFiles();

      // Generate environment files
      await this.generateEnvironmentFiles();

      // Generate configuration files
      await this.generateConfigFiles();

      spinner.succeed(chalk.green('Project structure created'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create project structure'));
      throw error;
    }
  }

  private async copyTemplateFiles(): Promise<void> {
    const templatePath = path.join(this.templateDir, this.options.template);

    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template not found: ${this.options.template}`);
    }

    await this.copyDirectory(templatePath, this.targetDir);
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Check if directory should be included based on options
        if (this.shouldIncludeDirectory(entry.name)) {
          await fs.ensureDir(destPath);
          await this.copyDirectory(srcPath, destPath);
        }
      } else {
        // Check if file should be included
        if (this.shouldIncludeFile(entry.name)) {
          await this.processFile(srcPath, destPath);
        }
      }
    }
  }

  private shouldIncludeDirectory(dirName: string): boolean {
    // Exclude test directory if tests are not included
    if (dirName === 'test' && !this.options.includeTests) {
      return false;
    }

    // Exclude OAuth directory if OAuth is not included
    if (dirName === 'oauth' && !this.options.authMethods.includes('oauth')) {
      return false;
    }

    return true;
  }

  private shouldIncludeFile(fileName: string): boolean {
    // Skip template-specific files
    if (fileName.endsWith('.ejs')) {
      return true;
    }

    return true;
  }

  private async processFile(src: string, dest: string): Promise<void> {
    const content = await fs.readFile(src, 'utf-8');

    // If file is an EJS template, render it
    if (src.endsWith('.ejs')) {
      const rendered = ejs.render(content, this.context);
      const destWithoutEjs = dest.replace(/\.ejs$/, '');
      await fs.writeFile(destWithoutEjs, rendered, 'utf-8');
    } else {
      // Copy file as-is
      await fs.copy(src, dest);
    }
  }

  private async generateEnvironmentFiles(): Promise<void> {
    const envExample = `# Node Environment
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="${this.context.databaseUrl}"

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="${generateRandomSecret(32)}"
JWT_REFRESH_SECRET="${generateRandomSecret(32)}"
JWT_ACCESS_EXPIRY="60m"
JWT_REFRESH_EXPIRY="30d"

# CORS
CORS_ORIGIN="${this.context.corsOrigin}"

# Logging
LOG_LEVEL="info"
${
  this.options.enableRedis
    ? `
# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
`
    : ''
}${
      this.options.authMethods.includes('oauth')
        ? `
# OAuth Providers
${
  this.options.oauthProviders.includes('google')
    ? `GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8080/api/v1/auth/google/callback"
`
    : ''
}${
  this.options.oauthProviders.includes('github')
    ? `GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:8080/api/v1/auth/github/callback"
`
    : ''
}${
  this.options.oauthProviders.includes('facebook')
    ? `FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_CALLBACK_URL="http://localhost:8080/api/v1/auth/facebook/callback"
`
    : ''
}${
  this.options.oauthProviders.includes('twitter')
    ? `TWITTER_CONSUMER_KEY="your-twitter-consumer-key"
TWITTER_CONSUMER_SECRET="your-twitter-consumer-secret"
TWITTER_CALLBACK_URL="http://localhost:8080/api/v1/auth/twitter/callback"
`
    : ''
}`
        : ''
    }${
      this.options.enableTwoFactor
        ? `
# Two-Factor Authentication
TWO_FACTOR_APP_NAME="${this.context.projectName}"
`
        : ''
    }
`;

    await fs.writeFile(path.join(this.targetDir, '.env.example'), envExample);
    await fs.writeFile(path.join(this.targetDir, '.env'), envExample);
  }

  private async generateConfigFiles(): Promise<void> {
    // Generate .gitignore
    const gitignore = `# Dependencies
node_modules/
dist/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Environment
.env
.env.local
.env.production
.env.test

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Prisma
${this.options.orm === 'prisma' ? 'generated/' : ''}
`;

    await fs.writeFile(path.join(this.targetDir, '.gitignore'), gitignore);

    // Generate .prettierrc
    const prettierrc = {
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      tabWidth: 2,
      semi: true,
    };

    await fs.writeFile(
      path.join(this.targetDir, '.prettierrc'),
      JSON.stringify(prettierrc, null, 2),
    );

    // Generate docker-compose.yml if needed
    if (this.options.database !== 'sqlite' || this.options.enableRedis) {
      await this.generateDockerCompose();
    }
  }

  private async generateDockerCompose(): Promise<void> {
    let dockerCompose = `version: '3.8'

services:
`;

    if (this.options.database === 'postgresql') {
      dockerCompose += `  postgres:
    image: postgres:16-alpine
    container_name: ${this.context.projectNameKebab}-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${this.context.projectName.replace(/[-\s]/g, '_')}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

`;
    } else if (this.options.database === 'mysql') {
      dockerCompose += `  mysql:
    image: mysql:8.0
    container_name: ${this.context.projectNameKebab}-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ${this.context.projectName.replace(/[-\s]/g, '_')}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

`;
    } else if (this.options.database === 'mongodb') {
      dockerCompose += `  mongodb:
    image: mongo:7
    container_name: ${this.context.projectNameKebab}-mongodb
    environment:
      MONGO_INITDB_DATABASE: ${this.context.projectName.replace(/[-\s]/g, '_')}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

`;
    }

    if (this.options.enableRedis) {
      dockerCompose += `  redis:
    image: redis:7-alpine
    container_name: ${this.context.projectNameKebab}-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

`;
    }

    dockerCompose += `volumes:
`;

    if (this.options.database === 'postgresql') {
      dockerCompose += `  postgres_data:\n`;
    } else if (this.options.database === 'mysql') {
      dockerCompose += `  mysql_data:\n`;
    } else if (this.options.database === 'mongodb') {
      dockerCompose += `  mongodb_data:\n`;
    }

    if (this.options.enableRedis) {
      dockerCompose += `  redis_data:\n`;
    }

    await fs.writeFile(path.join(this.targetDir, 'docker-compose.yml'), dockerCompose);
  }
}

import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { promptForOptions } from '../prompts';
import { ProjectOptions } from '../types/options';
import { FileGenerator } from '../utils/file-generator';
import { generateDependencies, generatePackageJson } from '../utils/package-json';
import { validateProjectName } from '../utils/validator';

export async function createCommand(
  projectNameArg?: string,
  options: any = {}
): Promise<void> {
  try {
    console.log();

    // Validate project name if provided
    if (projectNameArg) {
      const validation = validateProjectName(projectNameArg);
      if (!validation.valid) {
        console.error(chalk.red(`\n❌ Invalid project name: ${validation.error}\n`));
        process.exit(1);
      }
    }

    // Get project options from prompts
    const projectOptions: ProjectOptions = await promptForOptions(
      projectNameArg,
      options,
      options.defaults
    );

    const targetDir = path.resolve(process.cwd(), projectOptions.projectName);

    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      console.error(
        chalk.red(`\n❌ Directory "${projectOptions.projectName}" already exists.\n`)
      );
      process.exit(1);
    }

    console.log(chalk.cyan('\n🚀 Creating your NestJS auth project...\n'));

    // Step 1: Generate project structure
    const templateDir = path.join(__dirname, '..', '..', 'templates');
    const generator = new FileGenerator(templateDir, targetDir, projectOptions);
    await generator.generateFiles();

    // Step 2: Generate package.json
    const spinner = ora('Generating package.json...').start();
    const deps = generateDependencies(projectOptions);
    const packageJson = generatePackageJson(projectOptions, deps);
    await fs.writeFile(
      path.join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    spinner.succeed(chalk.green('package.json generated'));

    // Step 3: Generate README
    await generateReadme(targetDir, projectOptions);

    // Step 4: Initialize git
    if (!projectOptions.skipGit) {
      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await execa('git', ['init'], { cwd: targetDir });
        await execa('git', ['add', '.'], { cwd: targetDir });
        await execa('git', ['commit', '-m', 'Initial commit from create-nestjs-auth'], {
          cwd: targetDir,
        });
        gitSpinner.succeed(chalk.green('Git repository initialized'));
      } catch (error) {
        gitSpinner.warn(chalk.yellow('Git initialization skipped (git not found)'));
      }
    }

    // Step 5: Install dependencies
    if (!projectOptions.skipInstall) {
      await installDependencies(targetDir, projectOptions.packageManager);
    }

    // Step 6: Generate Prisma client (if Prisma)
    if (projectOptions.orm === 'prisma' && !projectOptions.skipInstall) {
      const prismaSpinner = ora('Generating Prisma client...').start();
      try {
        await execa(projectOptions.packageManager, ['run', 'prisma:generate'], {
          cwd: targetDir,
        });
        prismaSpinner.succeed(chalk.green('Prisma client generated'));
      } catch (error) {
        prismaSpinner.warn(chalk.yellow('Prisma generation skipped (run manually later)'));
      }
    }

    // Success message
    printSuccessMessage(projectOptions);
  } catch (error: any) {
    console.error(chalk.red('\n❌ Error creating project:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function installDependencies(
  targetDir: string,
  packageManager: 'npm' | 'yarn' | 'pnpm'
): Promise<void> {
  const spinner = ora(
    `Installing dependencies with ${chalk.cyan(packageManager)}... (this may take 2-3 minutes)`
  ).start();

  try {
    const command = packageManager === 'yarn' ? 'yarn' : packageManager;
    const args = packageManager === 'npm' ? ['install'] : [];

    await execa(command, args, { cwd: targetDir });
    spinner.succeed(chalk.green(`Dependencies installed with ${packageManager}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies'));
    console.log(chalk.yellow('\nYou can install dependencies manually:'));
    console.log(chalk.cyan(`  cd ${path.basename(targetDir)}`));
    console.log(chalk.cyan(`  ${packageManager} install\n`));
  }
}

async function generateReadme(targetDir: string, options: ProjectOptions): Promise<void> {
  const spinner = ora('Generating README...').start();

  const authMethodsStr = options.authMethods.join(', ').toUpperCase();
  const oauthStr = options.oauthProviders.length > 0 
    ? `OAuth (${options.oauthProviders.join(', ')})` 
    : '';

  const readme = `# ${options.projectName}

> Production-ready NestJS authentication system

## Features

✅ **Authentication**: ${authMethodsStr}
${oauthStr ? `✅ **OAuth Providers**: ${oauthStr}` : ''}
✅ **Authorization**: Role-Based Access Control (RBAC)
✅ **Security**: Bcrypt hashing, Helmet.js, Rate limiting
✅ **Token Management**: Refresh token rotation, Multi-device sessions
✅ **Database**: ${options.database.toUpperCase()} with ${options.orm === 'prisma' ? 'Prisma' : options.orm === 'typeorm' ? 'TypeORM' : 'Mongoose'}
${options.enableTwoFactor ? '✅ **Two-Factor Auth**: TOTP-based (Google Authenticator)' : ''}
${options.enableRedis ? '✅ **Caching**: Redis for session management' : ''}
✅ **Logging**: Structured logging with Pino
✅ **Validation**: Zod schema validation
${options.includeTests ? '✅ **Testing**: Jest unit tests + E2E tests' : ''}

## Prerequisites

- Node.js >= 20.x
- ${options.database === 'postgresql' ? 'PostgreSQL >= 16.x' : options.database === 'mysql' ? 'MySQL >= 8.x' : options.database === 'mongodb' ? 'MongoDB >= 7.x' : 'SQLite (included)'}
${options.enableRedis ? '- Redis >= 7.x' : ''}
- ${options.packageManager} >= ${options.packageManager === 'npm' ? '10.x' : options.packageManager === 'yarn' ? '1.22.x' : '8.x'}

## Quick Start

### 1. Configure Environment

\`\`\`bash
# Copy environment template
cp .env.example .env
\`\`\`

Edit \`.env\` with your settings. JWT secrets are pre-generated for development.

### 2. Start Database

${
  options.database !== 'sqlite'
    ? `\`\`\`bash
# Start database with Docker Compose
docker-compose up -d
\`\`\``
    : '_(SQLite requires no setup)_'
}

### 3. Run Migrations

${
  options.orm === 'prisma'
    ? `\`\`\`bash
${options.packageManager} run prisma:migrate
${options.packageManager} run prisma:seed
\`\`\`

**Default credentials**: \`admin@example.com\` / \`Admin@123\``
    : `\`\`\`bash
${options.packageManager} run migration:run
\`\`\``
}

### 4. Start Development Server

\`\`\`bash
${options.packageManager} run start:dev
\`\`\`

Server runs at: \`http://localhost:8080/api/v1\`

### 5. Verify Health

\`\`\`bash
curl http://localhost:8080/api/v1/health
\`\`\`

Expected: \`{"status":"ok","info":{"database":{"status":"up"}}...}\`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | \`/auth/signup\` | Register new user | No |
| POST | \`/auth/login\` | Login with credentials | No |
| POST | \`/auth/refresh\` | Refresh access token | Yes (refresh token) |
| POST | \`/auth/logout\` | Logout and invalidate tokens | Yes |
| GET | \`/auth/me\` | Get current user info | Yes |

${
  options.authMethods.includes('oauth') && options.oauthProviders.length > 0
    ? `
### OAuth

${options.oauthProviders.map(provider => `| GET | \`/auth/${provider}\` | Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)} | No |
| GET | \`/auth/${provider}/callback\` | ${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth callback | No |`).join('\n')}
`
    : ''
}

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | \`/users/profile\` | Get own profile | Yes |
| PATCH | \`/users/profile\` | Update own profile | Yes |
| GET | \`/users\` | List all users (paginated) | ADMIN |
| GET | \`/users/:id\` | Get user by ID | ADMIN |
| PATCH | \`/users/:id\` | Update user | ADMIN |
| DELETE | \`/users/:id\` | Soft delete user | ADMIN |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/health\` | Full health check with DB |
| GET | \`/health/ready\` | Readiness probe |
| GET | \`/health/live\` | Liveness probe |

## Example Usage

### Register User

\`\`\`bash
curl -X POST http://localhost:8080/api/v1/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123",
    "fullName": "John Doe"
  }'
\`\`\`

### Login

\`\`\`bash
curl -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
\`\`\`

### Get Current User

\`\`\`bash
curl -X GET http://localhost:8080/api/v1/auth/me \\
  -b cookies.txt
\`\`\`

## Project Structure

\`\`\`
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators (@Public, @Roles, @GetUser)
│   ├── guards/               # Auth & RBAC guards
│   ├── interceptors/         # Response transformation
│   ├── middleware/           # Correlation ID, logging
│   └── validators/           # Password validation
├── config/                    # Configuration module
│   ├── env.validation.ts     # Zod schema for env vars
│   └── logger.config.ts      # Pino logger setup
├── modules/
│   ├── auth/                 # Authentication module
│   ├── users/                # User management module
${options.authMethods.includes('oauth') ? '│   ├── oauth/                # OAuth strategies' : ''}
│   └── health/               # Health check module
└── ${options.orm === 'prisma' ? 'prisma' : options.orm === 'typeorm' ? 'database' : 'schemas'}/                   # Database ${options.orm === 'prisma' ? 'Prisma service' : 'configuration'}
\`\`\`

## Configuration

Key environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| \`DATABASE_URL\` | Yes | - | Database connection string |
| \`JWT_ACCESS_SECRET\` | Yes | - | Access token secret (32+ chars) |
| \`JWT_REFRESH_SECRET\` | Yes | - | Refresh token secret (32+ chars) |
| \`JWT_ACCESS_EXPIRY\` | No | \`60m\` | Access token lifetime |
| \`JWT_REFRESH_EXPIRY\` | No | \`30d\` | Refresh token lifetime |
| \`PORT\` | No | \`8080\` | Server port |
| \`CORS_ORIGIN\` | No | \`${options.corsOrigin}\` | Allowed origins |
| \`LOG_LEVEL\` | No | \`info\` | Logging level |

## Scripts

| Command | Description |
|---------|-------------|
| \`${options.packageManager} run start:dev\` | Start development server |
| \`${options.packageManager} run build\` | Build for production |
| \`${options.packageManager} run start:prod\` | Start production server |
| \`${options.packageManager} run lint\` | Lint and fix code |
| \`${options.packageManager} run format\` | Format code with Prettier |
${
  options.includeTests
    ? `| \`${options.packageManager} run test\` | Run unit tests |
| \`${options.packageManager} run test:e2e\` | Run E2E tests |
| \`${options.packageManager} run test:cov\` | Test coverage |`
    : ''
}
${
  options.orm === 'prisma'
    ? `| \`${options.packageManager} run prisma:migrate\` | Run database migrations |
| \`${options.packageManager} run prisma:studio\` | Open Prisma Studio |
| \`${options.packageManager} run prisma:seed\` | Seed database |`
    : ''
}

## Security Features

🔒 **Password Hashing**: Bcrypt with 12 rounds (2025 security baseline)  
🔒 **Token Security**: HttpOnly cookies, no localStorage exposure  
🔒 **Token Rotation**: Refresh tokens auto-rotate on use  
🔒 **Rate Limiting**: 5 auth attempts/min, 10 requests/min globally  
🔒 **CORS Protection**: Configurable allowed origins  
🔒 **Helmet.js**: Security headers (CSP, HSTS, XSS protection)  
🔒 **Input Validation**: Zod schema validation on all inputs  
🔒 **PII Protection**: Passwords/tokens auto-redacted from logs  
🔒 **Multi-Device Sessions**: Track up to 5 devices per user  

## Troubleshooting

### Database Connection Error

\`\`\`bash
# Check database is running
${options.database === 'postgresql' ? 'pg_isready -h localhost -p 5432' : options.database === 'mysql' ? 'mysqladmin ping' : options.database === 'mongodb' ? 'mongosh --eval "db.version()"' : 'N/A'}

# Restart database
docker-compose restart
\`\`\`

### JWT Verification Fails

\`\`\`bash
# Regenerate Prisma client
${options.packageManager} run prisma:generate
\`\`\`

### Port Already in Use

\`\`\`bash
# Find and kill process (Linux/Mac)
lsof -ti:8080 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
\`\`\`

## Contributing

1. Fork the repository
2. Create feature branch: \`git checkout -b feature/name\`
3. Commit changes: \`git commit -am 'Add feature'\`
4. Push to branch: \`git push origin feature/name\`
5. Submit pull request

${options.includeTests ? '**Note**: Run \`npm test\` before submitting PR' : ''}

## License

MIT License - see LICENSE file for details.

---

**Built with** ❤️ **using [create-nestjs-auth](https://www.npmjs.com/package/create-nestjs-auth)**

Need help? [Open an issue](https://github.com/masabinhok/production-ready-nestjs-auth/issues)
`;

  await fs.writeFile(path.join(targetDir, 'README.md'), readme);
  spinner.succeed(chalk.green('README.md generated'));
}

function printSuccessMessage(options: ProjectOptions): void {
  const hasDocker = options.database !== 'sqlite' || options.enableRedis;

  console.log(chalk.green.bold('\n✅ Success! Your NestJS auth project is ready.\n'));

  console.log(chalk.cyan('📁 Project created at:'));
  console.log(chalk.white(`   ${options.projectName}\n`));

  console.log(chalk.cyan('🚀 Next steps:\n'));
  console.log(chalk.white(`   ${chalk.yellow('cd')} ${options.projectName}`));

  if (options.skipInstall) {
    console.log(chalk.white(`   ${chalk.yellow(options.packageManager + ' install')}`));
  }

  if (hasDocker) {
    console.log(chalk.white(`   ${chalk.yellow('docker-compose up -d')}   ${chalk.gray('# Start database')}`));
  }

  if (options.orm === 'prisma') {
    if (options.skipInstall) {
      console.log(chalk.white(`   ${chalk.yellow(options.packageManager + ' run prisma:generate')}`));
    }
    console.log(
      chalk.white(`   ${chalk.yellow(options.packageManager + ' run prisma:migrate')}   ${chalk.gray('# Run migrations')}`)
    );
    console.log(
      chalk.white(`   ${chalk.yellow(options.packageManager + ' run prisma:seed')}      ${chalk.gray('# Seed database')}`)
    );
  }

  console.log(
    chalk.white(`   ${chalk.yellow(options.packageManager + ' run start:dev')}        ${chalk.gray('# Start dev server')}`)
  );

  console.log(chalk.cyan('\n📚 Documentation:'));
  console.log(chalk.white(`   ${options.projectName}/README.md\n`));

  console.log(chalk.cyan('🔐 Default credentials (after seeding):'));
  console.log(chalk.white(`   Email: ${chalk.yellow('admin@example.com')}`));
  console.log(chalk.white(`   Password: ${chalk.yellow('Admin@123')}\n`));

  console.log(chalk.cyan('🌐 API will be available at:'));
  console.log(chalk.white(`   ${chalk.yellow('http://localhost:8080/api/v1')}\n`));

  if (options.authMethods.includes('oauth') && options.oauthProviders.length > 0) {
    console.log(chalk.yellow('⚠️  OAuth Configuration Required:'));
    console.log(chalk.white('   Update OAuth credentials in .env file'));
    options.oauthProviders.forEach((provider) => {
      console.log(chalk.gray(`   - ${provider.toUpperCase()}_CLIENT_ID`));
      console.log(chalk.gray(`   - ${provider.toUpperCase()}_CLIENT_SECRET`));
    });
    console.log();
  }

  console.log(chalk.gray('═'.repeat(60)));
  console.log(
    chalk.cyan.bold('  ⭐ Star the repo: ') +
      chalk.white('https://github.com/masabinhok/production-ready-nestjs-auth')
  );
  console.log(chalk.gray('═'.repeat(60)) + '\n');
}

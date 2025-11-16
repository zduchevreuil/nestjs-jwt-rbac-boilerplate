import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create';

const program = new Command();

console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔐  CREATE-NESTJS-AUTH                                  ║
║   Production-Ready Authentication Boilerplate            ║
║                                                           ║
║   JWT • Refresh Tokens • RBAC • Multi-Device Sessions    ║
║   Bcrypt • Rate Limiting • Zero XSS Risk                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

program
  .name('create-nestjs-auth')
  .description('Instant NestJS authentication setup with JWT, OAuth, RBAC, and security best practices')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project to create')
  .option('-t, --template <type>', 'Template to use (full|minimal|api-only)', 'full')
  .option('-p, --package-manager <manager>', 'Package manager (npm|yarn|pnpm)', 'npm')
  .option('-d, --database <db>', 'Database type (postgresql|mysql|mongodb|sqlite)', 'postgresql')
  .option('--orm <orm>', 'ORM to use (prisma|typeorm|mongoose)', 'prisma')
  .option('--skip-install', 'Skip dependency installation', false)
  .option('--skip-git', 'Skip git initialization', false)
  .option('--defaults', 'Use default options without prompts', false)
  .action(createCommand);

program.parse();

# Contributing to create-nestjs-auth

Thank you for considering contributing to create-nestjs-auth! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node version, package manager)
- **Error messages** or logs
- **Screenshots** if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear title and description** of the enhancement
- **Use case** explaining why this would be useful
- **Proposed solution** if you have one in mind
- **Alternative solutions** you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear commit messages**
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Ensure tests pass** before submitting

#### Pull Request Guidelines

- Keep changes focused and atomic
- One feature/fix per pull request
- Include tests for new functionality
- Update README.md if adding new features
- Follow existing code conventions
- Add comments for complex logic

#### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cli): add MongoDB support
fix(prompts): validate email format correctly
docs(readme): update installation instructions
```

## Development Setup

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Git

### Setup Steps

1. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/production-ready-nestjs-auth.git
cd production-ready-nestjs-auth/cli
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Test locally:**
```bash
npm run dev my-test-app
```

### Project Structure

```
cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Command implementations
│   ├── prompts/              # Interactive prompts
│   ├── utils/                # Utility functions
│   └── types/                # TypeScript interfaces
├── templates/                # Project templates
│   ├── full/                # Full template
│   ├── minimal/             # Minimal template
│   └── api-only/            # API-only template
├── scripts/                  # Build scripts
└── bin/                      # CLI executable
```

### Testing

Before submitting a PR:

1. **Test template generation:**
```bash
npm run dev test-app
cd test-app
npm install
npm run start:dev
```

2. **Test different options:**
- Different databases (PostgreSQL, MySQL, MongoDB, SQLite)
- Different ORMs (Prisma, TypeORM, Mongoose)
- Different package managers (npm, yarn, pnpm)
- With and without optional features

3. **Verify all templates:**
```bash
npm run dev test-full -- --template=full
npm run dev test-minimal -- --template=minimal
npm run dev test-api -- --template=api-only
```

### Code Style

- **TypeScript**: Use strict mode
- **Formatting**: Prettier with provided config
- **Linting**: ESLint with provided config
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for classes and interfaces
  - SCREAMING_SNAKE_CASE for constants
- **Imports**: Organize and group related imports

### Adding New Features

#### Adding a New Database

1. Update `src/types/options.ts` to include new database type
2. Add database driver dependencies in `src/utils/package-json.ts`
3. Update `getDatabaseUrl()` in `src/utils/validator.ts`
4. Add Docker Compose configuration in `src/utils/file-generator.ts`
5. Update prompts in `src/prompts/index.ts`
6. Update documentation

#### Adding a New OAuth Provider

1. Add provider to `OAuthProvider` type in `src/types/options.ts`
2. Add passport strategy dependency in `src/utils/package-json.ts`
3. Update environment file generation in `src/utils/file-generator.ts`
4. Create strategy file in `templates/full/src/modules/oauth/strategies/`
5. Update OAuth module
6. Update documentation

#### Adding a New Template

1. Create template directory in `templates/`
2. Add template to type definitions
3. Update prompts
4. Add template-specific file filtering
5. Test thoroughly
6. Document in README

### Documentation

When adding features, update:

- **README.md**: Main CLI documentation
- **CHANGELOG.md**: Document changes
- **Generated README**: Template in `src/commands/create.ts`
- **Code comments**: Explain complex logic

## Release Process

Maintainers follow this process for releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x`
4. Push tag: `git push origin v1.x.x`
5. Build: `npm run build`
6. Publish: `npm publish`

## Questions?

- 💬 [Start a discussion](https://github.com/masabinhok/production-ready-nestjs-auth/discussions)
- 🐛 [Open an issue](https://github.com/masabinhok/production-ready-nestjs-auth/issues)
- 📧 Email: sabin.shrestha.er@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉

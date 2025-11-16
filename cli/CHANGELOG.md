# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### Added
- Initial release of create-nestjs-auth CLI
- Interactive project setup with 8 prompts
- Three template options: full, minimal, api-only
- Database support: PostgreSQL, MySQL, MongoDB, SQLite
- ORM support: Prisma, TypeORM, Mongoose
- JWT authentication with refresh token rotation
- Role-Based Access Control (RBAC)
- Multi-device session management
- Optional OAuth2 providers (Google, GitHub, Facebook, Twitter)
- Optional Two-Factor Authentication (TOTP)
- Optional Redis integration for session management
- Security features: Bcrypt, Helmet.js, Rate limiting
- Structured logging with Pino
- Docker Compose configuration generation
- Auto-generated environment files with random JWT secrets
- Custom README generation for each project
- Git initialization with initial commit
- Automatic dependency installation
- Example tests (Jest unit + E2E)
- Health check endpoints (liveness, readiness)
- PII-safe logging (passwords/tokens auto-redacted)
- --defaults flag for zero-configuration setup
- Package manager detection and support (npm, yarn, pnpm)
- Beautiful CLI with progress indicators and emojis
- Comprehensive error handling and validation
- Post-generation success message with next steps

### Security
- Bcrypt with 12 rounds (2025 security baseline)
- HttpOnly cookies for token storage (zero XSS risk)
- Automatic token rotation on refresh
- Rate limiting: 5 auth attempts/min, 10 requests/min globally
- Helmet.js security headers (CSP, HSTS, XSS protection)
- CORS configuration
- Input validation with Zod schemas
- Password strength validation
- Device tracking and session limits (5 per user)

### Documentation
- Comprehensive CLI README with quick start guide
- Template comparison table
- API endpoint documentation
- Security features list
- Troubleshooting guide
- Configuration reference
- Example curl commands
- Project structure diagram

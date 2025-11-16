# create-nestjs-auth

<div align="center">

🔐 **Production-Ready NestJS Auth CLI**

Create a fully configured NestJS authentication system in 45 seconds.

[![npm version](https://badge.fury.io/js/create-nestjs-auth.svg)](https://www.npmjs.com/package/create-nestjs-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

## Why This CLI?

**Manual Setup Time**: 4-6 hours of copying boilerplate, configuring JWT, setting up RBAC, securing endpoints...

**With create-nestjs-auth**: 45 seconds.

## What You Get

✅ **JWT Authentication** - Access + refresh tokens with automatic rotation  
✅ **RBAC** - Role-based access control (`@Roles()` decorator)  
✅ **Security** - Bcrypt (12 rounds), Helmet.js, rate limiting, HttpOnly cookies  
✅ **Multi-Device Sessions** - Track 5 devices per user, auto-cleanup  
✅ **OAuth Support** - Optional Google, GitHub, Facebook, Twitter  
✅ **2FA** - Optional TOTP-based two-factor authentication  
✅ **Database** - PostgreSQL, MySQL, MongoDB, or SQLite  
✅ **ORM** - Prisma, TypeORM, or Mongoose  
✅ **Logging** - Structured Pino logs with PII redaction  
✅ **Tests** - Optional Jest unit + E2E tests  
✅ **Docker** - docker-compose.yml included  

## Quick Start

### Interactive Mode (Recommended)

```bash
npx create-nestjs-auth my-app
```

Answer 8 questions, get a production-ready auth system.

### With Defaults (Zero Configuration)

```bash
npx create-nestjs-auth my-app --defaults
```

Uses: PostgreSQL + Prisma + JWT + OAuth (Google/GitHub) + Tests

### Custom Configuration

```bash
npx create-nestjs-auth my-app \\
  --template=full \\
  --database=postgresql \\
  --orm=prisma \\
  --package-manager=pnpm
```

## Templates

### 🎯 Full (Default)
Complete auth with JWT, OAuth, RBAC, 2FA support.
```bash
npx create-nestjs-auth my-app --template=full
```

### ⚡ Minimal
Basic JWT auth + RBAC (no OAuth).
```bash
npx create-nestjs-auth my-app --template=minimal
```

### 🔑 API-Only
JWT + API key authentication for backend services.
```bash
npx create-nestjs-auth my-app --template=api-only
```

## CLI Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `-t, --template` | `full\|minimal\|api-only` | `full` | Project template |
| `-p, --package-manager` | `npm\|yarn\|pnpm` | `npm` | Package manager |
| `-d, --database` | `postgresql\|mysql\|mongodb\|sqlite` | `postgresql` | Database type |
| `--orm` | `prisma\|typeorm\|mongoose` | `prisma` | ORM to use |
| `--skip-install` | - | `false` | Skip dependency installation |
| `--skip-git` | - | `false` | Skip git initialization |
| `--defaults` | - | `false` | Use defaults (no prompts) |

## What Gets Generated

```
my-app/
├── src/
│   ├── app.module.ts              # Root module with guards
│   ├── main.ts                    # Bootstrap with Helmet, CORS
│   ├── common/
│   │   ├── decorators/           # @Public(), @Roles(), @GetUser()
│   │   ├── guards/               # AuthGuard, RolesGuard
│   │   ├── interceptors/         # Response standardization
│   │   └── middleware/           # Correlation ID, logging
│   ├── config/
│   │   ├── env.validation.ts     # Zod schema for .env
│   │   └── logger.config.ts      # Pino structured logging
│   ├── modules/
│   │   ├── auth/                 # Signup, login, refresh, logout
│   │   ├── users/                # Profile, admin user management
│   │   ├── oauth/                # Google, GitHub strategies (if selected)
│   │   └── health/               # Health checks
│   └── prisma/                   # Prisma service (if Prisma selected)
├── prisma/
│   ├── schema.prisma             # User, RefreshToken models
│   ├── seed.ts                   # Creates admin@example.com
│   └── migrations/               # Auto-generated migrations
├── test/                          # E2E tests (if selected)
├── .env                          # Pre-filled with generated JWT secrets
├── .env.example
├── docker-compose.yml            # Database + Redis (if needed)
├── README.md                     # Custom README for your project
└── package.json                  # All dependencies configured
```

## After Generation

### 1. Start Database

```bash
cd my-app
docker-compose up -d
```

### 2. Run Migrations

```bash
npm run prisma:migrate
npm run prisma:seed
```

**Default credentials**: `admin@example.com` / `Admin@123`

### 3. Start Server

```bash
npm run start:dev
```

Server: `http://localhost:8080/api/v1`

### 4. Test It

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{"email":"admin@example.com","password":"Admin@123"}'

# Get profile
curl http://localhost:8080/api/v1/auth/me -b cookies.txt
```

## Example API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login (sets httpOnly cookies) |
| POST | `/auth/refresh` | 🔑 Refresh | Rotate tokens |
| POST | `/auth/logout` | 🔑 Access | Invalidate tokens |
| GET | `/auth/me` | 🔑 Access | Current user |
| GET | `/users/profile` | 🔑 Access | Own profile |
| PATCH | `/users/profile` | 🔑 Access | Update profile |
| GET | `/users` | 👑 ADMIN | List users (paginated) |
| GET | `/users/:id` | 👑 ADMIN | Get user by ID |
| PATCH | `/users/:id` | 👑 ADMIN | Update any user |
| DELETE | `/users/:id` | 👑 ADMIN | Soft delete user |

## Security Features

🔒 **Bcrypt** - 12 rounds (2025 security standard)  
🔒 **HttpOnly Cookies** - No XSS risk from localStorage  
🔒 **Token Rotation** - Refresh tokens auto-rotate on use  
🔒 **Rate Limiting** - 5 auth attempts/min, 10 requests/min  
🔒 **Helmet.js** - HSTS, CSP, XSS protection  
🔒 **CORS** - Configurable allowed origins  
🔒 **PII Protection** - Passwords/tokens redacted from logs  
🔒 **Multi-Device** - Track 5 sessions per user  

## Customization

### Adding a Protected Endpoint

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';

@Controller('posts')
export class PostsController {
  @Roles(UserRole.ADMIN) // Only admins can access
  @Get()
  findAll() {
    return 'All posts';
  }
}
```

### Making an Endpoint Public

```typescript
import { Public } from 'src/common/decorators/public.decorator';

@Public() // Skip authentication
@Get('public')
getPublic() {
  return 'Public data';
}
```

### Getting Current User

```typescript
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'generated/prisma/client';

@Get('me')
getProfile(@GetUser() user: User) {
  return user; // Auto-injected from JWT
}
```

## Comparison with Manual Setup

| Task | Manual | create-nestjs-auth |
|------|--------|-------------------|
| Setup time | 4-6 hours | 45 seconds |
| Auth endpoints | Write yourself | ✅ Included |
| JWT refresh flow | Debug for hours | ✅ Works out of box |
| RBAC setup | Copy from docs | ✅ `@Roles()` ready |
| Security headers | Configure Helmet | ✅ Pre-configured |
| Rate limiting | Install + setup | ✅ Configured |
| Cookie security | Research flags | ✅ HttpOnly, Secure |
| Logging | Wire up Pino | ✅ Structured logs |
| Tests | Write yourself | ✅ Example tests |
| Docker | Create compose file | ✅ Included |

## Troubleshooting

### Error: "JWT_ACCESS_SECRET must be at least 32 characters"

Edit `.env` and generate new secrets:
```bash
openssl rand -base64 32
```

### Error: "Can't reach database server"

```bash
# Check database is running
docker-compose ps

# Restart database
docker-compose restart
```

### Error: "Port 8080 in use"

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

## Requirements

- Node.js >= 20.x
- npm >= 10.x (or yarn/pnpm equivalent)
- Docker (for database)

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Validation**: Zod 4.x
- **Logging**: Pino
- **Security**: Helmet, Bcrypt, Rate limiting
- **ORM**: Prisma 6.x (or TypeORM/Mongoose)
- **Database**: PostgreSQL 16.x (or MySQL/MongoDB/SQLite)
- **Testing**: Jest 30.x

## Roadmap

- [ ] OAuth providers: LinkedIn, Discord
- [ ] Email verification flow
- [ ] Password reset via email
- [ ] Swagger/OpenAPI docs
- [ ] GraphQL variant
- [ ] WebSocket auth support

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) file.

## Author

**Sabin Shrestha**  
[GitHub](https://github.com/masabinhok) • [Website](https://sabinshrestha69.com.np)

## Support

- 🐛 [Report bugs](https://github.com/masabinhok/production-ready-nestjs-auth/issues)
- 💬 [Ask questions](https://github.com/masabinhok/production-ready-nestjs-auth/discussions)
- ⭐ [Star the repo](https://github.com/masabinhok/production-ready-nestjs-auth)

---

<div align="center">

**Built this? Please ⭐ star the repo so others find it.**

[Documentation](https://github.com/masabinhok/production-ready-nestjs-auth#readme) • [Examples](https://github.com/masabinhok/production-ready-nestjs-auth/tree/main/examples) • [Changelog](CHANGELOG.md)

</div>

# Development & Deployment Guide

## For CLI Developers

### Local Development

1. **Clone and setup:**
```bash
git clone https://github.com/masabinhok/production-ready-nestjs-auth.git
cd production-ready-nestjs-auth/cli
npm install
```

2. **Make changes** to source files in `src/`

3. **Test locally:**
```bash
npm run dev my-test-project
```

This builds the CLI and runs it to create a test project.

4. **Test generated project:**
```bash
cd my-test-project
npm install
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### Building for Production

```bash
npm run build
```

This:
1. Compiles TypeScript (`tsc`)
2. Copies templates to `dist/templates`
3. Creates executable in `bin/`

### Testing Different Scenarios

```bash
# Test with defaults
npm run dev test-defaults -- --defaults

# Test minimal template
npm run dev test-minimal -- --template=minimal

# Test with MySQL
npm run dev test-mysql -- --database=mysql

# Test with pnpm
npm run dev test-pnpm -- --package-manager=pnpm

# Test without install
npm run dev test-no-install -- --skip-install
```

### Publishing to NPM

1. **Ensure tests pass:**
```bash
npm test
```

2. **Update version:**
```bash
npm version patch  # or minor, major
```

3. **Build:**
```bash
npm run build
```

4. **Publish:**
```bash
npm publish
```

5. **Create GitHub release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## For Users (After Installation)

### Installation Methods

#### Method 1: NPX (Recommended)
```bash
npx create-nestjs-auth my-app
```

#### Method 2: Global Install
```bash
npm install -g create-nestjs-auth
create-nestjs-auth my-app
```

#### Method 3: Using Shorthand
```bash
npx cna my-app  # 'cna' is shorthand for create-nestjs-auth
```

### Post-Generation Setup

#### 1. Navigate to Project
```bash
cd my-app
```

#### 2. Configure Environment

The CLI generates `.env` with pre-filled JWT secrets. You may want to:

```bash
# Generate new JWT secrets (recommended for production)
openssl rand -base64 32

# Edit .env with your secrets and database URL
code .env  # or nano .env
```

#### 3. Start Database

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local Installation**

PostgreSQL:
```bash
# macOS
brew install postgresql@16
brew services start postgresql@16
createdb my_app_db

# Ubuntu
sudo apt install postgresql-16
sudo systemctl start postgresql
sudo -u postgres createdb my_app_db
```

MySQL:
```bash
# macOS
brew install mysql@8.0
brew services start mysql
mysql -u root -e "CREATE DATABASE my_app_db"

# Ubuntu
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql -e "CREATE DATABASE my_app_db"
```

MongoDB:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### 4. Run Migrations

**Prisma:**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

**TypeORM:**
```bash
npm run migration:run
npm run seed
```

**Mongoose:**
```bash
npm run seed
```

#### 5. Start Development Server

```bash
npm run start:dev
```

Server runs at: `http://localhost:8080/api/v1`

#### 6. Verify Installation

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Login with seeded admin
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@example.com","password":"Admin@123"}'

# Get current user
curl http://localhost:8080/api/v1/auth/me -b cookies.txt
```

Expected response: User object with `role: "ADMIN"`

## Deployment

### Option 1: Docker (Production)

1. **Create Dockerfile** (at project root):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npm run prisma:generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/main"]
```

2. **Build and run:**
```bash
docker build -t my-app .
docker run -p 8080:8080 --env-file .env my-app
```

### Option 2: Kubernetes

**Deployment YAML:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-auth-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nestjs-auth-api
  template:
    metadata:
      labels:
        app: nestjs-auth-api
    spec:
      containers:
      - name: api
        image: your-registry/my-app:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: JWT_ACCESS_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secrets
              key: access
        livenessProbe:
          httpGet:
            path: /api/v1/health/live
            port: 8080
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/health/ready
            port: 8080
          initialDelaySeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-auth-api
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: nestjs-auth-api
```

### Option 3: Serverless (AWS Lambda)

1. **Install Serverless:**
```bash
npm install -g serverless
npm install --save-dev serverless-offline
```

2. **Create serverless.yml:**
```yaml
service: nestjs-auth-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_ACCESS_SECRET: ${env:JWT_ACCESS_SECRET}
    JWT_REFRESH_SECRET: ${env:JWT_REFRESH_SECRET}

functions:
  main:
    handler: dist/lambda.handler
    events:
      - http:
          method: ANY
          path: /{proxy+}
          cors: true

plugins:
  - serverless-offline
```

3. **Create lambda.ts:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer;

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.setGlobalPrefix('api/v1');
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler = async (event, context) => {
  const server = await bootstrapServer();
  return server(event, context);
};
```

4. **Deploy:**
```bash
serverless deploy
```

### Option 4: Traditional VPS (Ubuntu)

1. **Install dependencies:**
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
```

2. **Setup PostgreSQL:**
```bash
sudo -u postgres createuser myapp
sudo -u postgres createdb myapp_db
sudo -u postgres psql -c "ALTER USER myapp WITH PASSWORD 'password';"
```

3. **Clone and build:**
```bash
git clone your-repo
cd your-app
npm install
npm run build
npm run prisma:migrate:deploy
```

4. **Setup PM2:**
```bash
npm install -g pm2
pm2 start dist/main.js --name "nestjs-auth"
pm2 startup
pm2 save
```

5. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable SSL:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## CI/CD Pipeline Examples

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker build -t myapp:${{ github.sha }} .
      - run: docker push myapp:${{ github.sha }}
      - run: kubectl set image deployment/myapp myapp=myapp:${{ github.sha }}
```

### GitLab CI

**.gitlab-ci.yml:**
```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run test
    - npm run test:e2e

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/myapp myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

## Monitoring & Observability

### Health Checks

The generated app includes health endpoints:

- `/health` - Full health check (includes DB)
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Logging

Structured logs with Pino are included. To send to external service:

**Datadog:**
```typescript
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-datadog',
    options: {
      apiKey: process.env.DATADOG_API_KEY,
      service: 'nestjs-auth-api',
    },
  },
});
```

**ELK Stack:**
```bash
npm install pino-elasticsearch
```

```typescript
const logger = pino({
  transport: {
    target: 'pino-elasticsearch',
    options: {
      node: 'http://elasticsearch:9200',
      index: 'nestjs-logs',
    },
  },
});
```

## Troubleshooting Production Issues

### High Memory Usage

```bash
# Check memory
node --expose-gc --max-old-space-size=2048 dist/main.js

# Enable heap snapshots
node --heapsnapshot-signal=SIGUSR2 dist/main.js
```

### Database Connection Pool

Increase pool size in Prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### Rate Limiting Issues

Adjust in `app.module.ts`:
```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000,
    limit: 100, // Increase for production
  },
])
```

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (32+ chars)
- [ ] Enable HTTPS/TLS
- [ ] Set secure cookie flags in production
- [ ] Configure CORS for your domain only
- [ ] Enable rate limiting
- [ ] Setup database backups
- [ ] Enable audit logging
- [ ] Review environment variables
- [ ] Setup monitoring and alerts
- [ ] Enable automatic security updates
- [ ] Implement DDoS protection
- [ ] Setup Web Application Firewall (WAF)

---

Need help? [Open an issue](https://github.com/masabinhok/production-ready-nestjs-auth/issues)

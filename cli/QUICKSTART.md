# ⚡ Quick Start Guide - Get Your CLI Running Now!

## Step 1: Install Dependencies (2 minutes)

```bash
cd c:\tech\nest-auth-template\cli
npm install
```

Expected output: All dependencies installed successfully.

## Step 2: Build the CLI (30 seconds)

```bash
npm run build
```

Expected output:
- TypeScript compiled to `dist/`
- Templates copied to `dist/templates/`

## Step 3: Test It Locally (1 minute)

```bash
npm run dev my-first-test
```

You'll see:
- ASCII art logo
- Interactive prompts (press Enter to accept defaults)
- File generation progress
- Success message

## Step 4: Verify the Generated Project (3 minutes)

```bash
cd my-first-test
npm install
docker-compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Step 5: Test the API (30 seconds)

Open a new terminal:

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}'

# Get current user
curl http://localhost:8080/api/v1/auth/me -b cookies.txt
```

Expected: You should see user data with admin role.

## 🎉 Success!

If you made it here, your CLI is working perfectly! You've successfully:
- ✅ Built the CLI tool
- ✅ Generated a project
- ✅ Started the server
- ✅ Tested authentication

## What's Next?

### Option A: Publish to NPM (Recommended)

1. **Create NPM account** at [npmjs.com/signup](https://www.npmjs.com/signup)

2. **Login:**
```bash
npm login
```

3. **Update package name** (if needed):
Edit `package.json` and change `"name": "create-nestjs-auth"` to your desired name (must be unique on NPM).

4. **Publish:**
```bash
cd c:\tech\nest-auth-template\cli
npm publish
```

5. **Test installation:**
```bash
npx create-nestjs-auth@latest my-published-test
```

### Option B: Keep Testing Locally

Test different configurations:

```bash
# Test minimal template
npm run dev test-minimal -- --template=minimal

# Test with MySQL
npm run dev test-mysql -- --database=mysql

# Test with defaults (no prompts)
npm run dev test-defaults -- --defaults

# Test without installing dependencies
npm run dev test-no-install -- --skip-install
```

### Option C: Push to GitHub

```bash
cd c:\tech\nest-auth-template
git add .
git commit -m "feat: add create-nestjs-auth CLI tool"
git push origin main
```

Then create a release on GitHub.

## Common Issues & Fixes

### Issue: "Cannot find module"
**Fix:**
```bash
cd c:\tech\nest-auth-template\cli
rm -rf node_modules
npm install
npm run build
```

### Issue: Port 8080 in use
**Fix:**
```bash
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force

# Then restart
npm run start:dev
```

### Issue: Docker not running
**Fix:**
- Start Docker Desktop
- Or use SQLite: `npm run dev test-sqlite -- --database=sqlite`

### Issue: Templates not found
**Fix:**
```bash
npm run copy-templates
```

## Testing Checklist

Before publishing, test:

- [ ] Generation with default options
- [ ] Generation with PostgreSQL
- [ ] Generation with MySQL
- [ ] Generation with MongoDB  
- [ ] Generation with SQLite
- [ ] Generation with npm
- [ ] Generation with yarn
- [ ] Generation with pnpm
- [ ] Full template
- [ ] Minimal template
- [ ] API-only template
- [ ] With OAuth enabled
- [ ] With Redis enabled
- [ ] With tests included
- [ ] Without tests
- [ ] Skip install flag
- [ ] Skip git flag
- [ ] Defaults flag

## Support

If you encounter any issues:

1. Check the error message carefully
2. Review `IMPLEMENTATION_SUMMARY.md`
3. Check GitHub issues
4. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version)

## Resources

- **Full Documentation**: `README.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Launch Strategy**: `LAUNCH_CHECKLIST.md`
- **Contributing**: `CONTRIBUTING.md`
- **Deployment**: `DEPLOYMENT.md`

---

**You're all set! Go build something amazing! 🚀**

Questions? Open an issue or reach out to sabin.shrestha.er@gmail.com

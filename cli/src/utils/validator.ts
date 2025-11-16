import validatePackageName from 'validate-npm-package-name';

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  const result = validatePackageName(name);
  
  if (!result.validForNewPackages) {
    return {
      valid: false,
      error: result.errors?.[0] || result.warnings?.[0] || 'Invalid package name',
    };
  }
  
  return { valid: true };
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function generateRandomSecret(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getDatabaseUrl(database: string, projectName: string): string {
  const dbName = projectName.replace(/[-\s]/g, '_');
  
  switch (database) {
    case 'postgresql':
      return `postgresql://postgres:postgres@localhost:5432/${dbName}`;
    case 'mysql':
      return `mysql://root:root@localhost:3306/${dbName}`;
    case 'sqlite':
      return `file:./${dbName}.db`;
    case 'mongodb':
      return `mongodb://localhost:27017/${dbName}`;
    default:
      return `postgresql://postgres:postgres@localhost:5432/${dbName}`;
  }
}

export function parseValidationErrors(errors: string[]): string {
  return errors.map((err) => `  ❌ ${err}`).join('\n');
}

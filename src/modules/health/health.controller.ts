import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  async checkReadiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      async () => {
        // Additional readiness checks can be added here
        // e.g., check if migrations are up to date
        return {
          application: {
            status: 'up',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
          },
        };
      },
    ]);
  }

  @Get('live')
  @Public()
  async checkLiveness() {
    // Lightweight check - just return if app is running
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      pid: process.pid,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    if (process.env.CHAT_METRICS_ENABLED === 'true') {
      this.$use(async (params, next) => {
        const startedAt = Date.now();
        const result = await next(params);
        const duration = Date.now() - startedAt;
        if (
          ['Message', 'Channel', 'ChannelMember', 'Block', 'Notification'].includes(
            params.model || '',
          )
        ) {
          // Lightweight DB timing probe for chat optimization work.
          console.log(
            `[prisma-metrics] ${params.model}.${params.action} ${duration}ms`,
          );
        }
        return result;
      });
    }
  }
}

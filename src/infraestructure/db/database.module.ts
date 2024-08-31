import { PrismaClient } from '@prisma/client';

export class DatabaseModule {
  constructor(private readonly client: PrismaClient) {}

  public async connect(): Promise<void> {
    return await this.client.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

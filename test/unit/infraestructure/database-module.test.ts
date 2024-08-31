import { mockDeep } from 'jest-mock-extended';
import { PrismaClient as Client } from '@prisma/client';
import { DatabaseModule } from '../../../src/infraestructure/db/database.module';
describe('Database module', () => {
  let prismaClient = mockDeep<Client>();

  it('should call the connect method', async () => {
    const databaseModule = new DatabaseModule(prismaClient);
    await databaseModule.connect();
    expect(prismaClient.$connect).toHaveBeenCalled();
  });

  it('should call the disconnect method', async () => {
    const databaseModule = new DatabaseModule(prismaClient);
    await databaseModule.disconnect();
    expect(prismaClient.$disconnect).toHaveBeenCalled();
  });
});

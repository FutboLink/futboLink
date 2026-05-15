import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

function makeUserService() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 300, totalPages: 0 }),
  };
}

async function buildControllerModule() {
  const mockUserService = makeUserService();
  const module: TestingModule = await Test.createTestingModule({
    controllers: [UserController],
    providers: [
      {
        provide: UserService,
        useValue: mockUserService,
      },
    ],
  }).compile();

  const controller = module.get<UserController>(UserController);
  return { controller, mockUserService };
}

describe('UserController — findAll', () => {
  it('forwards the email query param as the third argument to userService.findAll', async () => {
    const { controller, mockUserService } = await buildControllerModule();
    await controller.findAll('1', '20', 'alice');
    expect(mockUserService.findAll).toHaveBeenCalledWith(1, 20, 'alice');
  });

  it('calls userService.findAll without email when param is omitted', async () => {
    const { controller, mockUserService } = await buildControllerModule();
    await controller.findAll('1', '20', undefined);
    expect(mockUserService.findAll).toHaveBeenCalledWith(1, 20, undefined);
  });
});

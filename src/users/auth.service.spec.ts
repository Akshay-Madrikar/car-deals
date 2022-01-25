import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { UsersService } from './users.service';

let service: AuthService;
let fakeUserService: Partial<UsersService>;

describe('AuthService', () => {
  beforeEach(async () => {
    //Create a fake copy of the users service
    fakeUserService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hash password', async () => {
    const user = await service.signUp('asd@asd.com', '12345');

    expect(user.password).not.toEqual('12345');

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email already in use', async (done) => {
    fakeUserService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '12345' } as User]);

    try {
      await service.signUp('asd@asd.com', '12345');
    } catch (err) {
      done();
    }
  });
});

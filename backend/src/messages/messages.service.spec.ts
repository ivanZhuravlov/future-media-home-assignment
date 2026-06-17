import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { Tag } from './enums/tag.enum';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let repository: jest.Mocked<
    Pick<Repository<Message>, 'create' | 'save' | 'findOne'>
  >;

  const authorId = '11111111-1111-1111-1111-111111111111';
  const messageId = '22222222-2222-2222-2222-222222222222';
  const now = new Date('2025-06-01T12:00:00.000Z');

  const author: User = {
    id: authorId,
    email: 'alice@example.com',
    username: 'alice',
    passwordHash: 'hashed-password',
    createdAt: now,
    updatedAt: now,
  };

  const savedMessage: Message = {
    id: messageId,
    content: 'Hello world',
    tag: Tag.General,
    authorId,
    author,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('create()', () => {
    it('creates a message with a valid payload', async () => {
      const dto: CreateMessageDto = {
        content: 'Hello world',
        tag: Tag.Tech,
      };

      repository.create.mockReturnValue({
        ...savedMessage,
        content: dto.content,
        tag: dto.tag,
      });
      repository.save.mockResolvedValue({
        ...savedMessage,
        content: dto.content,
        tag: dto.tag,
      });
      repository.findOne.mockResolvedValue({
        ...savedMessage,
        content: dto.content,
        tag: dto.tag,
      });

      const result = await service.create(authorId, dto);

      expect(repository.create).toHaveBeenCalledWith({
        content: dto.content,
        tag: dto.tag,
        authorId,
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: messageId,
        content: 'Hello world',
        tag: Tag.Tech,
        authorId,
        author: {
          id: authorId,
          username: 'alice',
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });
  });

  describe('create() input validation (CreateMessageDto)', () => {
    async function validateCreateDto(
      plain: Record<string, unknown>,
    ): Promise<string[]> {
      const dto = plainToInstance(CreateMessageDto, plain);
      const errors = await validate(dto);
      return errors.flatMap((error) => Object.values(error.constraints ?? {}));
    }

    it('rejects content over 240 characters', async () => {
      const messages = await validateCreateDto({
        content: 'a'.repeat(241),
        tag: Tag.General,
      });

      expect(messages.length).toBeGreaterThan(0);
      expect(messages.some((message) => message.includes('240'))).toBe(true);
    });

    it('rejects an invalid tag', async () => {
      const messages = await validateCreateDto({
        content: 'Valid content',
        tag: 'NotARealTag',
      });

      expect(messages.length).toBeGreaterThan(0);
      expect(
        messages.some((message) =>
          message.toLowerCase().includes('tag'),
        ),
      ).toBe(true);
    });

    it('accepts a valid payload', async () => {
      const messages = await validateCreateDto({
        content: 'Valid content',
        tag: Tag.Question,
      });

      expect(messages).toHaveLength(0);
    });
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  MessageResponse,
  MessagesListResponse,
} from './dto/message-response.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const CURSOR_SEPARATOR = '|';

interface ParsedCursor {
  createdAt: Date;
  id: string;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  async create(
    authorId: string,
    dto: CreateMessageDto,
  ): Promise<MessageResponse> {
    const message = this.messagesRepository.create({
      content: dto.content,
      tag: dto.tag,
      authorId,
    });

    const saved = await this.messagesRepository.save(message);
    const withAuthor = await this.findById(saved.id);

    if (!withAuthor) {
      throw new NotFoundException('Message not found');
    }

    return this.toResponse(withAuthor);
  }

  async findMany(query: QueryMessagesDto): Promise<MessagesListResponse> {
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .take(limit + 1);

    if (query.tag) {
      qb.andWhere('message.tag = :tag', { tag: query.tag });
    }

    if (query.userId) {
      qb.andWhere('message.authorId = :userId', { userId: query.userId });
    }

    if (query.from) {
      qb.andWhere('message.createdAt >= :from', { from: new Date(query.from) });
    }

    if (query.to) {
      qb.andWhere('message.createdAt <= :to', { to: new Date(query.to) });
    }

    if (query.cursor) {
      const { createdAt, id } = this.parseCursor(query.cursor);
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('message.createdAt < :cursorCreatedAt', { cursorCreatedAt: createdAt })
            .orWhere(
              'message.createdAt = :cursorCreatedAt AND message.id < :cursorId',
              { cursorCreatedAt: createdAt, cursorId: id },
            );
        }),
      );
    }

    const messages = await qb.getMany();
    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const lastItem = page.at(-1);

    return {
      items: page.map((message) => this.toResponse(message)),
      nextCursor:
        hasMore && lastItem ? this.encodeCursor(lastItem) : null,
    };
  }

  async findById(id: string): Promise<Message | null> {
    return this.messagesRepository.findOne({
      where: { id },
      relations: { author: true },
    });
  }

  async update(id: string, dto: UpdateMessageDto): Promise<MessageResponse> {
    const message = await this.findById(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (dto.content !== undefined) {
      message.content = dto.content;
    }

    if (dto.tag !== undefined) {
      message.tag = dto.tag;
    }

    const saved = await this.messagesRepository.save(message);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.messagesRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException('Message not found');
    }
  }

  private encodeCursor(message: Message): string {
    return `${message.createdAt.toISOString()}${CURSOR_SEPARATOR}${message.id}`;
  }

  private parseCursor(cursor: string): ParsedCursor {
    const separatorIndex = cursor.lastIndexOf(CURSOR_SEPARATOR);

    if (separatorIndex === -1) {
      throw new BadRequestException('Invalid cursor');
    }

    const createdAtRaw = cursor.slice(0, separatorIndex);
    const id = cursor.slice(separatorIndex + 1);
    const createdAt = new Date(createdAtRaw);

    if (Number.isNaN(createdAt.getTime()) || !id) {
      throw new BadRequestException('Invalid cursor');
    }

    return { createdAt, id };
  }

  private toResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      content: message.content,
      tag: message.tag,
      authorId: message.authorId,
      author: {
        id: message.author.id,
        username: message.author.username,
      },
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { MessagesService } from '../messages.service';

@Injectable()
export class MessageOwnerGuard implements CanActivate {
  constructor(private readonly messagesService: MessagesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayloadUser | undefined;

    if (!user) {
      throw new ForbiddenException();
    }

    const messageId = request.params.id;
    if (typeof messageId !== 'string') {
      throw new NotFoundException('Message not found');
    }

    const message = await this.messagesService.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.authorId !== user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}

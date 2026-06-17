import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageOwnerGuard } from './guards/message-owner.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayloadUser, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(user.id, dto);
  }

  @Get()
  findMany(@Query() query: QueryMessagesDto) {
    return this.messagesService.findMany(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, MessageOwnerGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MessageOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.messagesService.remove(id);
  }
}

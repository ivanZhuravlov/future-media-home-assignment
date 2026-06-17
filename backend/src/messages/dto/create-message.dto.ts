import { IsEnum, IsString, MaxLength } from 'class-validator';
import { Tag } from '../enums/tag.enum';

export class CreateMessageDto {
  @IsString()
  @MaxLength(240)
  content: string;

  @IsEnum(Tag)
  tag: Tag;
}

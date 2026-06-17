import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Tag } from '../enums/tag.enum';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  content?: string;

  @IsOptional()
  @IsEnum(Tag)
  tag?: Tag;
}

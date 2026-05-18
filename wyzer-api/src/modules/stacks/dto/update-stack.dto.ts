import { PartialType } from '@nestjs/swagger';
import { CreateStackDto } from './create-stack.dto';

export class UpdateStackDto extends PartialType(CreateStackDto) {}

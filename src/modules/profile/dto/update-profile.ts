import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

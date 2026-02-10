import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsNumber, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Do Task 1',
    minLength: 1,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  title!: string;
  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  version!: number;
}

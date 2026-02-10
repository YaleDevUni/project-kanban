import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../task-status.enum';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Title of the task',
    example: 'Do Task 1',
  })
  title!: string;

  @ApiProperty({
    description: 'Status of the task',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'Name of the user who owns the task',
    example: 'John Doe',
  })
  user!: string;

  @ApiProperty({
    description: 'Position of the task for ordering within its status column',
    example: '0|hzzzzz',
  })
  position!: string;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  version!: number;
}

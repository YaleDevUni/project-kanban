import { IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { TaskStatus } from '../task-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class MoveTaskDto {
  @ApiProperty({
    description: 'New status of the task. Can be TODO, DOING, or DONE',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus; // column

  @ApiPropertyOptional({
    description: 'ID of the previous task in the new status column',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  prevTaskId?: string;

  @ApiPropertyOptional({
    description: 'ID of the next task in the new status column',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  nextTaskId?: string;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  @IsNumber()
  version!: number; // version for optimistic lock
}

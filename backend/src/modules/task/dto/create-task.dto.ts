import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../task-status.enum';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Status of the task. Can be TODO, DOING, or DONE',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}

import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  Index,
  OptionalProps,
} from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { Workspace } from '../workspace/workspace.entity';
import { TaskStatus } from './task-status.enum';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity({ tableName: 'tasks' })
export class Task {
  [OptionalProps]?: 'status' | 'version' | 'createdAt' | 'updatedAt';

  @ApiProperty({
    description: 'Unique identifier of the task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @ApiProperty({
    description: 'User who owns the task',
    type: () => User,
    nullable: true,
  })
  @ApiHideProperty()
  @ManyToOne('User', {
    nullable: true,
    deleteRule: 'set null',
  })
  user?: User;

  @ApiProperty({
    description: 'Workspace this task belongs to',
    type: () => Workspace,
  })
  @ApiHideProperty()
  @ManyToOne(() => Workspace, {
    nullable: false,
    deleteRule: 'cascade',
  })
  workspace!: Workspace;

  @ApiProperty({
    description: 'Title of the task',
    example: 'Do Task 1',
  })
  @Property({ length: 255 })
  title!: string;

  @ApiProperty({
    description: 'Status of the task',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @Enum(() => TaskStatus)
  @Property()
  status: TaskStatus = TaskStatus.TODO;

  @ApiProperty({
    description: 'Position of the task for ordering within its status column',
    example: '0|hzzzzz',
  })
  @Property()
  @Index()
  position!: string;

  @ApiProperty({
    description: 'Version number for optimistic locking',
    example: 1,
  })
  @Property({ version: true })
  version!: number;
  // not in use currently
  // @Property()
  // createdAt: Date = new Date();

  // @Property({ onUpdate: () => new Date() })
  // updatedAt: Date = new Date();
}

import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { Task } from '../task/task.entity';

@Entity({ tableName: 'workspaces' })
export class Workspace {
  @ApiProperty({
    description: 'Unique identifier of the workspace',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @ApiProperty({
    description: 'Title of the workspace',
    example: 'My Project',
  })
  @Property({ length: 255 })
  title!: string;

  @ApiProperty({
    description: 'User who created the workspace',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: false })
  creator!: User;

  @ApiProperty({
    description: 'Creation date of the workspace',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Property()
  createdAt: Date = new Date();

  @ApiHideProperty()
  @OneToMany(() => Task, (task) => task.workspace, {
    cascade: [Cascade.REMOVE],
    orphanRemoval: true,
  })
  tasks = new Collection<Task>(this);
}

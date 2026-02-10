import {
  Entity,
  OneToMany,
  PrimaryKey,
  Collection,
  Property,
  BeforeCreate,
  Unique,
} from '@mikro-orm/core';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import type { Task } from '../task/task.entity';
import * as bcrypt from 'bcrypt';

@Entity({ tableName: 'users' })
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryKey({ type: 'uuid', defaultRaw: `gen_random_uuid()`, length: 36 })
  id!: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  @Property({ length: 100 })
  name!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @Property({ length: 255 })
  @Unique()
  email!: string;

  @ApiHideProperty()
  @Property({ length: 255, hidden: true })
  password!: string;

  // @OneToMany('Task', 'user')
  // tasks = new Collection<Task>(this);

  @BeforeCreate()
  private beforeCreate() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}

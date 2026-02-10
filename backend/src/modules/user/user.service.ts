import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  async findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  async create(name: string, email: string, password: string): Promise<User> {
    const user = this.em.create(User, { name, email, password });
    await this.em.persist(user).flush();
    return user;
  }
}

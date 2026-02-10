import { Injectable, ConflictException } from '@nestjs/common';
import {
  EntityManager,
  EntityRepository,
  OptimisticLockError,
} from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Task } from './task.entity';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { LexoRank } from 'lexorank';
import { User } from '../user/user.entity';
import { Workspace } from '../workspace/workspace.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: EntityRepository<Task>,
    private readonly workspaceService: WorkspaceService,
    private readonly eventEmitter: EventEmitter2,
    private readonly em: EntityManager,
  ) {}

  private emitChange(workspaceId: string, type: string, data: any): void {
    this.eventEmitter.emit('task.message', { workspaceId, type, data });
  }

  async create(
    workspaceId: string,
    createDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    // 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceEntity(workspaceId);

    // 현재 워크스페이스의 status 컬럼에서 마지막 position 찾기
    const lastTask = await this.taskRepository.findOne(
      { workspace, status: createDto.status },
      { orderBy: { position: 'DESC' } },
    );

    let newPosition: string;

    if (lastTask) {
      newPosition = LexoRank.parse(lastTask.position).genNext().toString();
    } else {
      newPosition = LexoRank.middle().toString();
    }

    const taskCount = await this.taskRepository.count({ workspace });

    const title = `작업 ${taskCount + 1}`;

    const task = this.taskRepository.create({
      ...createDto,
      title,
      user,
      workspace,
      position: newPosition,
    });

    await this.em.persist(task).flush();

    this.emitChange(workspaceId, 'create', task);
    return task;
  }

  async moveTask(
    workspaceId: string,
    id: string,
    moveDto: MoveTaskDto,
  ): Promise<Task> {
    // 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceEntity(workspaceId);

    const task = await this.taskRepository.findOneOrFail(
      {
        id,
        workspace,
      },
      { populate: ['user'] },
    );

    let prevRank: LexoRank | undefined;
    let nextRank: LexoRank | undefined;

    if (moveDto.prevTaskId) {
      const prevTask = await this.taskRepository.findOneOrFail({
        id: moveDto.prevTaskId,
        workspace,
      });
      prevRank = LexoRank.parse(prevTask.position);
    }

    if (moveDto.nextTaskId) {
      const nextTask = await this.taskRepository.findOneOrFail({
        id: moveDto.nextTaskId,
        workspace,
      });
      nextRank = LexoRank.parse(nextTask.position);
    }

    // calculate new position
    let newPosition: string;

    if (prevRank && nextRank) {
      newPosition = prevRank.between(nextRank).toString();
    } else if (prevRank) {
      newPosition = prevRank.genNext().toString();
    } else if (nextRank) {
      newPosition = nextRank.genPrev().toString();
    } else {
      newPosition = LexoRank.middle().toString();
    }

    // assign for increase version
    this.taskRepository.assign(task, {
      status: moveDto.status,
      position: newPosition,
      version: moveDto.version, // version for optimistic lock
    });

    // flush with optimistic lock check
    try {
      await this.em.flush();
      this.emitChange(workspaceId, 'move', task);
    } catch (e) {
      if (e instanceof OptimisticLockError) {
        throw new ConflictException(
          '이미 다른 사용자에 의해 수정된 태스크입니다. 새로고침 후 다시 시도해주세요.',
        );
      }
      throw e;
    }

    return task;
  }

  async update(
    workspaceId: string,
    id: string,
    updateDto: UpdateTaskDto,
  ): Promise<Task> {
    // 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceEntity(workspaceId);

    const task = await this.taskRepository.findOneOrFail(
      { id, workspace },
      { populate: ['user'] },
    );

    this.taskRepository.assign(task, {
      ...updateDto,
      version: updateDto.version, // optimistic lock
    });

    try {
      await this.em.flush();
      this.emitChange(workspaceId, 'update', task);
    } catch (e) {
      if (e instanceof OptimisticLockError) {
        throw new ConflictException(
          '이미 다른 사용자에 의해 수정된 태스크입니다. 새로고침 후 다시 시도해주세요.',
        );
      }
      throw e;
    }

    return task;
  }

  async findAll(workspaceId: string, search?: string): Promise<TaskResponseDto[]> {
    // 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceEntity(workspaceId);

    const query: any = { workspace };

    if (search && search.trim() !== '') {
      query.$and = [
        { workspace },
        {
          $or: [
            { title: { $ilike: `%${search}%` } },
            { user: { name: { $ilike: `%${search}%` } } },
          ],
        },
      ];
      delete query.workspace;
    }

    const tasks = await this.taskRepository.find(query, {
      populate: ['user'],
      fields: ['id', 'title', 'status', 'user.name', 'position', 'version'],
      orderBy: { position: 'ASC' },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      user: {
        name: task.user.name,
      },
      position: task.position,
      version: task.version,
    }));
  }

  async delete(workspaceId: string, id: string) {
    // 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceEntity(workspaceId);

    const task = await this.taskRepository.findOneOrFail({ id, workspace });
    await this.em.remove(task).flush();
    this.emitChange(workspaceId, 'delete', { id });
    return { success: true };
  }
}

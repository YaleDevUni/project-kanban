import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Workspace } from './workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { User } from '../user/user.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: EntityRepository<Workspace>,
    private readonly em: EntityManager,
  ) {}

  async create(
    createDto: CreateWorkspaceDto,
    user: User,
  ): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      title: createDto.title,
      creator: user,
    });

    await this.em.persist(workspace).flush();
    return workspace;
  }

  async findAll(): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.workspaceRepository.find(
      {},
      {
        populate: ['creator'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return workspaces.map((workspace) => ({
      id: workspace.id,
      title: workspace.title,
      creator: {
        id: workspace.creator.id,
        name: workspace.creator.name,
      },
      createdAt: workspace.createdAt,
    }));
  }

  async findOne(id: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceRepository.findOne(
      { id },
      { populate: ['creator'] },
    );

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return {
      id: workspace.id,
      title: workspace.title,
      creator: {
        id: workspace.creator.id,
        name: workspace.creator.name,
      },
      createdAt: workspace.createdAt,
    };
  }

  async update(
    id: string,
    updateDto: UpdateWorkspaceDto,
    user: User,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne(
      { id },
      { populate: ['creator'] },
    );

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    // Only creator can update the workspace
    if (workspace.creator.id !== user.id) {
      throw new ForbiddenException('Only the creator can update this workspace');
    }

    this.workspaceRepository.assign(workspace, updateDto);
    await this.em.flush();

    return workspace;
  }

  async delete(id: string, user: User): Promise<{ success: boolean }> {
    const workspace = await this.workspaceRepository.findOne(
      { id },
      { populate: ['creator', 'tasks'] },
    );

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    // Only creator can delete the workspace
    if (workspace.creator.id !== user.id) {
      throw new ForbiddenException('Only the creator can delete this workspace');
    }

    // Cascade delete will automatically remove all tasks
    await this.em.remove(workspace).flush();

    return { success: true };
  }

  async findWorkspaceEntity(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({ id });
    
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    
    return workspace;
  }
}

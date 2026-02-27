import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Sse,
  MessageEvent,
  UseGuards,
} from '@nestjs/common';
import { fromEvent, map, filter, Observable } from 'rxjs';
import { TaskService } from './task.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { Task } from './task.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@ApiTags('Tasks')
@Controller('workspaces/:workspaceId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('events') // GET /workspaces/:workspaceId/tasks/events
  @ApiOperation({
    summary: 'Task Events Stream',
    description: 'Stream task events via Server-Sent Events (SSE) for a specific workspace.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of task events.',
  })
  sse(@Param('workspaceId') workspaceId: string): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'task.message').pipe(
      filter((payload: any) => payload.workspaceId === workspaceId),
      map(
        (payload: any) =>
          ({
            data: { type: payload.type, data: payload.data },
          }) as MessageEvent,
      ),
    );
  }

  /**
   * 전체 태스크 조회 (검색 기능 포함)
   * GET /workspaces/:workspaceId/tasks?search=연
   */
  @Get()
  @ApiOperation({
    summary: 'Get all tasks in workspace',
    description: 'Retrieve all tasks in a workspace with optional search',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiOkResponse({ type: [TaskResponseDto] })
  async findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('search') search?: string,
  ): Promise<TaskResponseDto[]> {
    return await this.taskService.findAll(workspaceId, search);
  }

  /**
   * 태스크 생성
   * POST /workspaces/:workspaceId/tasks
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new task in workspace',
    description: 'Create a new task with the given title and status in a workspace',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiOkResponse({ type: Task })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() createDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return await this.taskService.create(workspaceId, createDto, user);
  }

  /**
   * 태스크 위치/상태 이동 (LexoRank)
   * PATCH /workspaces/:workspaceId/tasks/:id/move
   */
  @Patch(':id/move')
  @ApiOperation({
    summary: 'Move a task',
    description:
      'Move a task to a new status and position using LexoRank algorithm.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOkResponse({ type: Task })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict due to version mismatch.',
  })
  async moveTask(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() moveDto: MoveTaskDto,
  ) {
    return await this.taskService.moveTask(workspaceId, id, moveDto);
  }

  /**
   * 일반 정보 수정 (제목 등)
   * PATCH /workspaces/:workspaceId/tasks/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description: 'Update task information such as title.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOkResponse({ type: Task })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict due to version mismatch.',
  })
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    return await this.taskService.update(workspaceId, id, updateDto);
  }

  /**
   * 태스크 삭제
   * DELETE /workspaces/:workspaceId/tasks/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Delete a task by its ID.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOkResponse({ description: 'Task deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async delete(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return await this.taskService.delete(workspaceId, id);
  }
}

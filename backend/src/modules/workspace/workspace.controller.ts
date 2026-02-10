import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { Workspace } from './workspace.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /**
   * 전체 워크스페이스 조회
   * GET /workspaces
   */
  @Get()
  @ApiOperation({
    summary: 'Get all workspaces',
    description: 'Retrieve all workspaces',
  })
  @ApiOkResponse({ type: [WorkspaceResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async findAll(): Promise<WorkspaceResponseDto[]> {
    return await this.workspaceService.findAll();
  }

  /**
   * 특정 워크스페이스 조회
   * GET /workspaces/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a workspace by ID',
    description: 'Retrieve a specific workspace by its ID',
  })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  async findOne(@Param('id') id: string): Promise<WorkspaceResponseDto> {
    return await this.workspaceService.findOne(id);
  }

  /**
   * 워크스페이스 생성
   * POST /workspaces
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new workspace',
    description: 'Create a new workspace with the given title',
  })
  @ApiOkResponse({ type: Workspace })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createDto: CreateWorkspaceDto,
    @Req() req: any,
  ): Promise<Workspace> {
    return await this.workspaceService.create(createDto, req.user);
  }

  /**
   * 워크스페이스 수정
   * PATCH /workspaces/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a workspace',
    description: 'Update workspace information such as title.',
  })
  @ApiOkResponse({ type: Workspace })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only creator can update.' })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkspaceDto,
    @Req() req: any,
  ): Promise<Workspace> {
    return await this.workspaceService.update(id, updateDto, req.user);
  }

  /**
   * 워크스페이스 삭제
   * DELETE /workspaces/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a workspace',
    description: 'Delete a workspace by its ID. All tasks in the workspace will also be deleted.',
  })
  @ApiOkResponse({ description: 'Workspace deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only creator can delete.' })
  @ApiResponse({ status: 404, description: 'Workspace not found.' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return await this.workspaceService.delete(id, req.user);
  }
}

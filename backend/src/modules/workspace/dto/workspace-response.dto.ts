import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the workspace',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Title of the workspace',
    example: 'My Project',
  })
  title!: string;

  @ApiProperty({
    description: 'Creator information',
    example: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'John Doe' },
  })
  creator!: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'Creation date of the workspace',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;
}

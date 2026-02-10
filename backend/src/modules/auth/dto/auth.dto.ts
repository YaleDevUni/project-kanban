import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    maxLength: 100,
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@example.com',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'strongPassword123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@exmample.com',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'strongPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

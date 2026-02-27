import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Register a new user with the given credentials.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return a JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout the user (client-side token invalidation).',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
  })
  logout() {
    return this.authService.logout();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the profile of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

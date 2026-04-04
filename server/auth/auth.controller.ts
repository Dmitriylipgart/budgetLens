import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async me(@CurrentUser() userId: number) {
    const user = await this.authService.getUser(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}

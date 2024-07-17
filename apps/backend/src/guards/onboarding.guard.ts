// onboarding.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class OnboardingGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    console.log(request.cookies)
    const token = request.headers['x-onboarding-token']
    console.log(token, 'middleware')

    if (!token) {
      throw new UnauthorizedException('Onboarding token is missing')
    }

    try {
      const isValid = this.authService.verifyOnboardingToken(token)
      if (!isValid) {
        throw new UnauthorizedException('Invalid onboarding token')
      }
      return true
    } catch (error) {
      throw new UnauthorizedException('Invalid onboarding token')
    }
  }
}

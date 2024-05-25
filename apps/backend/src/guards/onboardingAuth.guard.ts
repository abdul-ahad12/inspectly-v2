import { AuthService } from '@/auth/auth.service'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class OnboardingAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    if (!request.headers.cookie) {
      throw new HttpException(
        'onboarding token missing!',
        HttpStatus.UNAUTHORIZED,
      )
    }
    console.log(
      JSON.stringify(request.headers.cookie).split('=')[1].replace(/"/g, ''),
    )
    const token = JSON.stringify(request.headers.cookie)
      .split('=')[1]
      .replace(/"/g, '')

    if (!token || !request?.body?.phoneNumber) {
      throw new HttpException(
        'onboarding token or phone number missing!',
        HttpStatus.UNAUTHORIZED,
      )
    }

    const isVerified = this.authService.verifyOnboardingToken(
      token,
      request.body.phoneNumber,
    )

    if (!isVerified) {
      throw new HttpException(
        'Invalid or expired onboarding token.',
        HttpStatus.FORBIDDEN,
      )
    }
    return isVerified
  }
}

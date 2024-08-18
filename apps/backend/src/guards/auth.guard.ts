import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const accessToken = this.extractTokenFromCookie(request)
    const xsrfToken = request.headers['x-xsrf-token']

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing')
    }

    if (!xsrfToken) {
      throw new UnauthorizedException('XSRF token is missing')
    }

    try {
      // Combine JWT secret and XSRF token for verification
      const secretKey = process.env.JWT_SECRET + xsrfToken

      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: secretKey,
      })

      // Attach userId and userRole to the request object
      request['user'] = {
        id: payload.sub,
        role: payload.role,
      } // Assuming 'sub' is the userId

      return true
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired')
      }
      throw new ForbiddenException('Invalid access token or XSRF token')
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const accessToken = request.cookies['accessToken']
    if (accessToken) {
      return accessToken
    }
    return undefined
  }
}

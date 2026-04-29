import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { User } from "@prisma/client";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: User }>();
    if (!req.user?.isAdmin) {
      throw new ForbiddenException("Apenas administradores.");
    }
    return true;
  }
}

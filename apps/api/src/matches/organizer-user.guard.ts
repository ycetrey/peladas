import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { RequestWithOrganizer } from "./request-with-organizer";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class OrganizerUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithOrganizer>();
    const raw = req.headers["x-organizer-user-id"];
    if (raw === undefined || typeof raw !== "string" || !raw.trim()) {
      throw new UnauthorizedException("Missing X-Organizer-User-Id");
    }
    const id = raw.trim();
    if (!uuidRe.test(id)) {
      throw new UnauthorizedException("Invalid X-Organizer-User-Id");
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException("Organizer user not found");
    }
    req.organizerUser = user;
    return true;
  }
}

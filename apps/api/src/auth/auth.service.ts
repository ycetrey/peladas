import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas.");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Credenciais inválidas.");
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
    const access_token = this.jwt.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    };
  }
}

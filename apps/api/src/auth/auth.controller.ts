import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

type RequestWithUser = Request & { user: User };

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  me(@Req() req: RequestWithUser) {
    const u = req.user;
    return {
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        isAdmin: u.isAdmin,
      },
    };
  }
}

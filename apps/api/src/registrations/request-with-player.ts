import type { User } from "@prisma/client";
import type { Request } from "express";

export type RequestWithPlayer = Request & { playerUser?: User };

import type { User } from "@prisma/client";
import type { Request } from "express";

export type RequestWithOrganizer = Request & { organizerUser?: User };

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { DomainError } from "../errors/domain-errors";

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const notFoundCodes = new Set([
      "MatchNotFoundError",
      "VenueNotFoundError",
      "GroupNotFoundError",
    ]);
    const forbiddenCodes = new Set([
      "VenueNotOwnedError",
      "GroupNotOwnedError",
    ]);
    const conflictCodes = new Set([
      "VenueHasMatchesError",
      "GroupHasMatchesError",
    ]);
    const status = notFoundCodes.has(exception.code)
      ? HttpStatus.NOT_FOUND
      : forbiddenCodes.has(exception.code)
        ? HttpStatus.FORBIDDEN
        : conflictCodes.has(exception.code)
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;
    response.status(status).json({
      error: {
        code: exception.code,
        message: exception.message,
      },
    });
  }
}

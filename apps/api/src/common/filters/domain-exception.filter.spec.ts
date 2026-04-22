import { HttpStatus } from "@nestjs/common";
import { ArgumentsHost } from "@nestjs/common";
import { MatchNotFoundError } from "../errors/domain-errors";
import { DomainExceptionFilter } from "./domain-exception.filter";

describe("DomainExceptionFilter", () => {
  it("serializes MatchNotFoundError as 404 with stable error.code", () => {
    const filter = new DomainExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new MatchNotFoundError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: "MatchNotFoundError",
        message: "Match not found",
      },
    });
  });
});

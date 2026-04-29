import { Prisma } from "@prisma/client";

/** Postgres serialization failure — safe to retry the whole transaction. */
const SERIALIZATION_FAILURE = "P2034";

/**
 * Runs `run` up to `maxAttempts` times, retrying only on Prisma P2034
 * (transaction serialization / write skew under Serializable).
 */
export async function runWithSerializableRetry<T>(
  run: () => Promise<T>,
  options?: { maxAttempts?: number },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 5;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await run();
    } catch (e) {
      lastError = e;
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === SERIALIZATION_FAILURE &&
        attempt < maxAttempts - 1
      ) {
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

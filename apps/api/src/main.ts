import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "./common/filters/domain-exception.filter";

function corsOrigins(): string[] {
  const jogador = process.env.WEB_JOGADOR_ORIGIN ?? "http://localhost:3002";
  const admin = process.env.WEB_ADMIN_ORIGIN ?? "http://localhost:3003";
  const raw = `${jogador},${admin}`;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : ["http://localhost:3002", "http://localhost:3003"];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = process.env.PORT ?? "3001";
  await app.listen(port);
}

bootstrap();

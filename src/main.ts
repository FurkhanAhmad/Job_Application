import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RolesGuard } from './common/guards/role.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new RolesGuard(app.get('Reflector')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('NestJS CRUD API with Swagger')
    .setVersion('1.0')
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      description:
        'HttpOnly JWT access token cookie set by /auth/register or /auth/login.',
    })
    .addTag('Authentication', 'Register, login, and logout endpoints')
    .addTag('Users')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📄 Swagger Docs: http://localhost:3000/api`);
}

bootstrap();

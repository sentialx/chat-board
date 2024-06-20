import "reflect-metadata";

import { resolve } from "path";

import fastifyCookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { mbToBytes } from "~/common/js/fs";
import { run } from "~/common/nest/lifecycle";
import { createLogger } from "~/common/nest/logger";

import { AuthApiController } from "./auth/auth_api_controller";
import { AuthGuard } from "./auth/auth_guard";
import { AuthService } from "./auth/auth_service";
import { AuthUserEntity } from "./auth/auth_user_entity";
import { JwtService } from "./auth/jwt";
import { ChatApiController } from "./chat/chat_api_controller";
import { ChatEventEntity } from "./chat/chat_event_entity";
import { ChatThreadGuard } from "./chat/chat_guard";
import { ChatService } from "./chat/chat_service";
import { ChatThreadEntity } from "./chat/chat_thread_entity";
import { ConfigService, ENV_SCHEMA, getDbConfig } from "./config_service";
import { DebugApiController } from "./debug_api_controller";
import { MediaAccessEntity } from "./media/media_access_entity";
import { MediaApiController } from "./media/media_api_controller";
import { MediaEntity } from "./media/media_entity";
import { MediaService } from "./media/media_service";
import { MeApiController } from "./user/me_api_controller";
import { UserApiController } from "./user/user_api_controller";
import { UserEntity } from "./user/user_entity";
import { UserService } from "./user/user_service";
import { WorkspaceEntity } from "./workspace/workspace_entity";
import { RoleEntity } from "./role/role_entity";
import { TaskEntity } from "./task/task_entity";
import { WorkspaceController } from "./workspace/workspace_controller";
import { TaskController } from "./task/task_controller";
import { RoleController } from "./role/role_controller";
import { WorkspaceService } from "./workspace/workspace_service";
import { RoleService } from "./role/role_service";
import { TaskService } from "./task/task_service";

const entities = [
  UserEntity,
  AuthUserEntity,
  MediaEntity,
  ChatThreadEntity,
  ChatEventEntity,
  MediaAccessEntity,
  WorkspaceEntity,
  RoleEntity,
  TaskEntity,
];

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...getDbConfig(),
      entities,
      debug: process.env["NODE_ENV"] === "development",
      forceUtcTimezone: true,
      strict: true,
      allowGlobalContext: true,
      discovery: {
        requireEntitiesArray: true,
      },
    }),
    MikroOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      envFilePath: [resolve(".env.test"), resolve(".env")],
      cache: true,
      validationSchema: ENV_SCHEMA,
    }),
  ],
  controllers: [
    ChatApiController,
    AuthApiController,
    UserApiController,
    MeApiController,
    MediaApiController,
    DebugApiController,
    WorkspaceController,
    TaskController,
    RoleController,
  ],
  providers: [
    ConfigService,
    ChatThreadGuard,
    ChatService,
    AuthService,
    UserService,
    JwtService,
    AuthGuard,
    MediaService,
    WorkspaceService,
    RoleService,
    TaskService,
  ],
})
class AppModule {}

run(async (): Promise<void> => {
  const adapter = new FastifyAdapter({ bodyLimit: mbToBytes(256) });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      rawBody: true,
      logger: createLogger({
        path: resolve(process.env["OUT_PATH"] ?? "", "api.log"),
      }),
    },
  );

  const config = app.get(ConfigService);

  await app.register(fastifyCookie, {
    secret: config.cookieSecret,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.register(multipart as any, {});
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const orm = app.get(MikroORM);
  await orm.getMigrator().up({});
  await orm.getSchemaGenerator().updateSchema({ wrap: false });

  await app.listen(config.port, "0.0.0.0", (err, address) => {
    if (err) console.error(err);
    console.log(`Listening on ${address}`);
  });
});

import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { UserEntity } from "../user/user_entity";

export const getUserFromExecutionCtx = (ctx: ExecutionContext): UserEntity => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserEntity;
};

export const SessionUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getUserFromExecutionCtx(ctx);
  },
);

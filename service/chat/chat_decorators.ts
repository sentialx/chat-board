import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { ChatThreadEntity } from "./chat_thread_entity";

export const getChatThreadFromExecutionCtx = (
  ctx: ExecutionContext,
): ChatThreadEntity => {
  const request = ctx.switchToHttp().getRequest();
  return request.chatThread as ChatThreadEntity;
};

export const ChatThread = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return getChatThreadFromExecutionCtx(ctx);
  },
);

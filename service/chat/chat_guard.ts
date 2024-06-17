import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { getUserFromExecutionCtx } from "../auth/auth_decorators";
import { NotAuthenticated } from "../auth/auth_exceptions";

import { ChatThreadNoAccessException } from "./chat_exceptions";
import { ChatService } from "./chat_service";

@Injectable()
export class ChatThreadGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const user = getUserFromExecutionCtx(ctx);
    if (user == null) throw new NotAuthenticated();

    const threadUuid = ctx.switchToHttp().getRequest().params.threadUuid;
    const thread = await this.chatService.findThreadByUuid(threadUuid);

    const canAccess = await this.chatService.canUserAccessThread(thread, user);
    if (!canAccess) throw new ChatThreadNoAccessException();

    req.chatThread = thread;

    return true;
  }
}

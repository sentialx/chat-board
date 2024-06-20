import {
  Controller,
  Body,
  Get,
  Post,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { FileInterceptor } from "~/common/nest/multipart/file_interceptor";
import { MemoryStorageFile } from "~/common/nest/multipart/memory_storage";

import {
  ChatEventType,
  ChatEventsSseRequest,
  ChatMediaEvent,
  ChatMessageEvent,
  GetChatEventsRequest,
  GetChatEventsResponse,
  GetChatThreadWithUserRequest,
  GetChatThreadWithUserResponse,
  GetChatThreadsRequest,
  GetChatThreadsResponse,
  SendChatMediaRequest,
  SendChatMediaResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "../../common";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";
import { UserService } from "../user/user_service";

import { ChatThread } from "./chat_decorators";
import { ChatEventEntity } from "./chat_event_entity";
import { ChatThreadGuard } from "./chat_guard";
import { ChatService } from "./chat_service";
import { ChatThreadEntity } from "./chat_thread_entity";
import { WorkspaceService } from "../workspace/workspace_service";

@Controller("chat")
export class ChatApiController {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Get("/threads")
  @UseGuards(AuthGuard)
  public async getThreads(
    @Query() body: GetChatThreadsRequest,
    @SessionUser() user: UserEntity,
  ): Promise<GetChatThreadsResponse> {
    const threads = await this.chatService.getThreads([user]);
    return Promise.all(
      threads.map((e) => this.chatService.asApiChatThread(e, user)),
    );
  }

  @Get("/user")
  @UseGuards(AuthGuard)
  public async getThreadWithUser(
    @SessionUser() user: UserEntity,
    @Query() query: GetChatThreadWithUserRequest,
  ): Promise<GetChatThreadWithUserResponse> {
    const workspace = (
      await this.workspaceService.fromUuid(query.workspaceUuid)
    ).unwrap();
    await this.userService.checkIsInWorkspace(user, workspace);

    const targetUser = (
      await this.userService.fromUuid(query.userUuid)
    ).unwrap();
    await this.userService.checkIsInWorkspace(targetUser, workspace);

    const isTargetingSelf = user.uuid === targetUser.uuid;

    const threads = await this.chatService.getThreads(
      isTargetingSelf ? [user] : [user, targetUser],
      workspace,
    );
    const minParticipants = isTargetingSelf ? 1 : 2;
    const thread = (
      await Promise.all(
        threads.map(async (t) => {
          await t.participants.init();
          return t;
        }),
      )
    ).find((t) => t.participants.getItems().length === minParticipants);

    if (!thread) {
      return this.chatService.asApiChatThread(
        await this.chatService.createThread([user, targetUser], workspace),
        user,
      );
    }

    return this.chatService.asApiChatThread(thread, user);
  }

  @Post("/thread/:threadUuid/message")
  @UseGuards(AuthGuard, ChatThreadGuard)
  public async sendMessage(
    @Body() body: SendChatMessageRequest,
    @ChatThread() thread: ChatThreadEntity,
    @SessionUser() user: UserEntity,
  ): Promise<SendChatMessageResponse> {
    let e = new ChatEventEntity({
      type: ChatEventType.Message,
      sender: user,
      thread,
      deviceId: body.deviceId,
      data: body.text,
    });
    e = await this.chatService.sendEvent(e);
    return {
      event: await this.chatService.asApiChatEvent<ChatMessageEvent>(e),
    };
  }

  @Post("/thread/:threadUuid/media")
  @UseGuards(AuthGuard, ChatThreadGuard)
  @UseInterceptors(FileInterceptor("media", {}))
  public async sendMedia(
    @UploadedFile() file: MemoryStorageFile,
    @Body() body: SendChatMediaRequest,
    @ChatThread() thread: ChatThreadEntity,
    @SessionUser() user: UserEntity,
  ): Promise<SendChatMediaResponse> {
    if (file?.buffer == null) throw new BadRequestException();
    await thread.participants.init();
    const participants = thread.participants.getItems();
    const media = await this.mediaService.createMedia({
      buffer: file.buffer,
      filename: file.filename,
      visibleFor: participants,
      owner: user,
    });
    const e = new ChatEventEntity({
      type: ChatEventType.Media,
      sender: user,
      thread,
      deviceId: body.deviceId,
      data: media.uuid,
    });
    return {
      event: await this.chatService
        .sendEvent(e)
        .then((r) => this.chatService.asApiChatEvent<ChatMediaEvent>(r)),
      user: { credits: user.credits },
    };
  }

  @Get("/thread/:threadUuid/events")
  @UseGuards(AuthGuard, ChatThreadGuard)
  public async getThreadsEvents(
    @Query() body: GetChatEventsRequest,
    @ChatThread() thread: ChatThreadEntity,
    @SessionUser() user: UserEntity,
  ): Promise<GetChatEventsResponse> {
    const { events, hasMore } = await this.chatService.getEvents(thread, {
      before: body.before,
      limit: body.limit,
    });
    return {
      events: await Promise.all(
        events.map((e) => this.chatService.asApiChatEvent(e)),
      ),
      hasMore,
    };
  }

  @Sse("/thread/:threadUuid/sse")
  @UseGuards(AuthGuard, ChatThreadGuard)
  public async sse(
    @Query() query: ChatEventsSseRequest,
    @ChatThread() thread: ChatThreadEntity,
    @SessionUser() user: UserEntity,
  ): Promise<Observable<MessageEvent>> {
    return this.chatService.createThreadEventsSse(thread, user);
  }
}

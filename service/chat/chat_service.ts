import { EntityRepository, MikroORM, EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable, MessageEvent } from "@nestjs/common";
import { Observable } from "rxjs";
import { EventEmitter, EventRegistry } from "~/common/js/events";
import { randomUuid } from "~/common/node/random";

import {
  ChatThread as ApiChatThread,
  Media as ApiMedia,
  ChatEvent as ApiChatEvent,
  ChatEventData,
  ChatEventType,
  ChatEventsSseResponse,
} from "../../common";
import { ConfigService } from "../config_service";
import { MediaEntity } from "../media/media_entity";
import { MediaService } from "../media/media_service";
import { UserEntity } from "../user/user_entity";
import { UserService } from "../user/user_service";

import { ChatEventEntity } from "./chat_event_entity";
import { ChatThreadEntity } from "./chat_thread_entity";
import { WorkspaceEntity } from "../workspace/workspace_entity";

export interface ChatEvent {
  eventEntity: ChatEventEntity;
}

export interface ChatTypingEvent {
  thread: ChatThreadEntity;
  isTyping: boolean;
  user: {
    uuid: string;
  };
}

export type ChatEvents = {
  event: (e: ChatEvent) => void;
};

@Injectable()
export class ChatService extends EventRegistry<ChatEvents> {
  private readonly emitter = new EventEmitter<ChatEvents>(this);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(ChatEventEntity)
    private readonly chatEventsRepo: EntityRepository<ChatEventEntity>,
    @InjectRepository(ChatThreadEntity)
    private readonly chatThreadsRepo: EntityRepository<ChatThreadEntity>,
    @InjectRepository(UserEntity)
    private readonly users: EntityRepository<UserEntity>,
    private readonly em: EntityManager,
    private readonly orm: MikroORM<PostgreSqlDriver>,
    private readonly mediaService: MediaService,
  ) {
    super();
  }

  public async createThread(
    users: UserEntity[],
    workspace: WorkspaceEntity,
  ): Promise<ChatThreadEntity> {
    const isGroup = users.length > 2;

    if (!isGroup) {
      const [thread] = await this.chatThreadsRepo
        .getEntityManager()
        .getConnection()
        .execute(
          `
SELECT *
FROM chat_threads AS c
WHERE c.uuid IN (
    SELECT chat_thread_entity_uuid
    FROM chat_threads_participants
    WHERE user_entity_uuid IN (?)
    GROUP BY chat_thread_entity_uuid
    HAVING COUNT(DISTINCT user_entity_uuid) = 2
)
AND c.is_group = false
LIMIT 1;
  `,
          [users.map((u) => u.uuid)],
        );
      if (thread != null) {
        return await this.chatThreadsRepo.findOneOrFail({
          uuid: thread.uuid,
        });
      }
    }

    const thread = new ChatThreadEntity();
    thread.participants.set(users);
    thread.isGroup = isGroup;
    thread.workspace = workspace;
    await this.em.persistAndFlush(thread);
    return thread;
  }

  public async getThreads(
    participants: UserEntity[],
    workspace?: WorkspaceEntity,
  ): Promise<ChatThreadEntity[]> {
    const query = {
      participants: {
        $in: participants,
      },
    } as any;

    if (workspace != null) {
      query["workspace"] = {
        uuid: workspace.uuid,
      };
    }
    return this.chatThreadsRepo.find(query, {
      orderBy: {
        lastActivityAt: "DESC",
      },
    });
  }

  public async getEvents(
    thread: ChatThreadEntity,
    opts: { limit?: number; before?: number } = {},
  ): Promise<{ events: ChatEventEntity[]; hasMore: boolean }> {
    const limit = Math.min(
      opts.limit ?? this.configService.maxMessagesPerResponse,
      this.configService.maxMessagesPerResponse,
    );
    const events = await this.chatEventsRepo.find(
      {
        thread,
        ...(opts.before == null
          ? {}
          : {
              createdAt: {
                $lt: new Date(opts.before),
              },
            }),
      },
      {
        limit,
        orderBy: {
          createdAt: "DESC",
        },
      },
    );
    const hasMore = events.length >= limit;
    return { events, hasMore };
  }

  public async asApiChatEvent<T = ApiChatEvent>(
    entity: ChatEventEntity,
  ): Promise<T> {
    const data = entity.data;
    const res = {
      uuid: entity.uuid,
      data,
      type: entity.type,
      threadUuid: entity.thread.uuid,
      createdAt: entity.createdAt.getTime(),
    } as any;
    if (entity.sender != null) {
      (res as any)["senderUuid"] = entity.sender.uuid;
    }
    return res as T;
  }

  public async getThreadParticipants(
    thread: ChatThreadEntity,
  ): Promise<UserEntity[]> {
    const res = await thread.participants.init();
    return res.getItems();
  }

  public async asApiChatThread(
    thread: ChatThreadEntity,
    user: UserEntity,
  ): Promise<ApiChatThread> {
    let picture: ApiMedia | undefined;
    let title: string | undefined = "";
    const lastActivityAt = thread.lastActivityAt;
    let lastEvent: ApiChatEvent | undefined = undefined;

    const participants = await this.getThreadParticipants(thread);

    if (!thread.isGroup) {
      let otherUser = participants.find((u) => u.uuid !== user.uuid);
      // Edge case: thread with self
      if (otherUser == null) {
        otherUser = user;
      }
      await this.em.populate(otherUser, ["avatar"]);
      picture = await this.mediaService.asApiMedia(
        otherUser.avatar as any as MediaEntity,
      );
      title = otherUser.displayName;

      if (thread.lastEvent != null) {
        await this.em.populate(thread, ["lastEvent"]);
        const lastEventEntity = thread.lastEvent as any as ChatEventEntity;
        lastEvent = await this.asApiChatEvent(lastEventEntity);
        // if (
        //   [ChatEventType.Info, ChatEventType.Message].includes(lastEvent.type)
        // ) {
        //   const lastMessage = await this.chatEventsRepo.findOne(
        //     thread.lastEvent as any,
        //   );
        //   lastActivityText = lastMessage?.data as string;
        // } else if ([ChatEventType.Media].includes(lastEvent.type)) {
        //   lastActivityText = `Sent a photo`;
        // } else if ([ChatEventType.PremiumMedia].includes(lastEvent.type)) {
        //   const premiumMedia = await this.premiumMediaRepo.findOneOrFail(
        //     lastEvent.data as string,
        //   );
        //   lastActivityText = `Sent a premium photo: ${premiumMedia.caption}`;
        // }
      }
    }

    await this.em.populate(thread, ["workspace"]);

    return {
      uuid: thread.uuid,
      lastEvent,
      picture,
      lastActivityAt: lastActivityAt.getTime(),
      title,
      participants: participants.map((u) => u.uuid),
      isGroup: thread.isGroup,
      reads: thread.reads,
      workspaceUuid: thread.workspace.uuid,
    };
  }

  public async findThreadByUuid(uuid: string): Promise<ChatThreadEntity> {
    return await this.chatThreadsRepo.findOneOrFail({
      uuid,
    });
  }

  public async canUserAccessThread(
    thread: ChatThreadEntity,
    user: UserEntity,
  ): Promise<boolean> {
    const threadUsers = await thread.participants.init();
    return threadUsers.contains(user);
  }

  public async sendEvent(e: ChatEventEntity): Promise<ChatEventEntity> {
    const thread = e.thread;
    if (e.thread?.uuid == null) throw new Error("Thread is not persisted");

    e.thread.lastActivityAt = new Date();
    (thread as any).lastEvent = e;

    await this.em.persistAndFlush([thread, e]);

    this.emitter.emit("event", { eventEntity: e });

    return e;
  }

  public createThreadEventsSse(
    thread: ChatThreadEntity,
    user: UserEntity,
  ): Observable<MessageEvent> {
    const threadUuid = thread.uuid;
    return new Observable<MessageEvent>((subscriber) => {
      this.on("event", async ({ eventEntity: e }) => {
        if (e.thread.uuid !== threadUuid) return;
        subscriber.next({
          data: {
            deviceId: e.deviceId,
            events: [await this.asApiChatEvent(e)],
          } as ChatEventsSseResponse,
        });
      });
    });
  }

  public async sendTypingStatus(
    thread: ChatThreadEntity,
    sender: UserEntity,
    isTyping: boolean = true,
  ): Promise<void> {
    const e = new ChatEventEntity({
      thread,
      sender,
      type: ChatEventType.Typing,
      data: isTyping,
      uuid: randomUuid(),
    });
    this.emitter.emit("event", { eventEntity: e });
  }

  public async sendReadStatus(
    thread: ChatThreadEntity,
    user: UserEntity,
  ): Promise<void> {
    const readAt = Date.now();

    thread.reads[user.uuid] = readAt;
    await this.em.persistAndFlush(thread);

    const e = new ChatEventEntity({
      thread,
      type: ChatEventType.Read,
      data: { readAt, userUuid: user.uuid },
      uuid: randomUuid(),
    });
    this.emitter.emit("event", { eventEntity: e });
  }

  public async sendMedia(
    thread: ChatThreadEntity,
    sender: UserEntity,
    media: MediaEntity,
  ): Promise<ChatEventEntity> {
    return this.sendEvent(
      new ChatEventEntity({
        sender,
        type: ChatEventType.Media,
        data: media.uuid,
        thread,
      }),
    );
  }

  public async handleUpdatedEvent(
    eventEntity: ChatEventEntity,
  ): Promise<ChatEventEntity> {
    await this.em.persistAndFlush(eventEntity);
    this.emitter.emit("event", { eventEntity });
    return eventEntity;
  }
}

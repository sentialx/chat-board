import {
  Entity,
  Enum,
  Index,
  PrimaryKey,
  Property,
  ManyToOne,
} from "@mikro-orm/core";

import { ChatEventData, ChatEventType } from "../../common/chat";
import { UserEntity } from "../user/user_entity";

import { ChatThreadEntity } from "./chat_thread_entity";

@Entity({ tableName: "chat_events" })
export class ChatEventEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property({ columnType: "jsonb", nullable: true })
  data?: ChatEventData;

  @Index()
  @Enum(() => ChatEventType)
  type!: ChatEventType;

  @ManyToOne(() => UserEntity, { nullable: true })
  sender?: UserEntity;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @ManyToOne(() => ChatThreadEntity)
  thread!: ChatThreadEntity;

  deviceId?: string;

  constructor(opts: Partial<ChatEventEntity> = {}) {
    Object.assign(this, opts);
    this.createdAt ??= new Date();
  }
}

import {
  Entity,
  Enum,
  Index,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
  OneToMany,
  OneToOne,
  ManyToOne,
} from "@mikro-orm/core";

import { UserEntity } from "../user/user_entity";

import { ChatEventEntity } from "./chat_event_entity";
import { WorkspaceEntity } from "../workspace/workspace_entity";

@Entity({ tableName: "chat_threads" })
export class ChatThreadEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @Property({ nullable: true })
  title?: string;

  @Property()
  isGroup!: boolean;

  @ManyToMany({ entity: () => UserEntity })
  participants = new Collection<UserEntity>(this);

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  lastActivityAt!: Date;

  @Property({ columnType: "jsonb" })
  reads: { [userUuid: string]: number } = {};

  @OneToOne(() => ChatEventEntity, { nullable: true })
  lastEvent?: typeof ChatEventEntity;

  @ManyToOne(() => WorkspaceEntity)
  workspace!: WorkspaceEntity;

  constructor(opts: Partial<ChatThreadEntity> = {}) {
    Object.assign(this, opts);
  }
}

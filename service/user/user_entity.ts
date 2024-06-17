import {
  Entity,
  PrimaryKey,
  Property,
  OneToOne,
  Collection,
  ManyToMany,
  OneToMany,
  ManyToOne,
  Index,
  Enum,
} from "@mikro-orm/core";

import { AuthUserEntity } from "../auth/auth_user_entity";
import { MediaEntity } from "../media/media_entity";

@Entity({ tableName: "users" })
export class UserEntity {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  uuid!: string;

  @ManyToMany(() => AuthUserEntity)
  authUsers = new Collection<AuthUserEntity>(this);

  @Property()
  displayName!: string;

  @Property({ columnType: "timestamp", defaultRaw: "now()" })
  createdAt!: Date;

  @ManyToOne(() => MediaEntity, { nullable: true })
  avatar?: typeof MediaEntity;

  @Property({ type: "text", nullable: true })
  timeZone?: string;
}

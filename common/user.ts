import { Media } from "./media";

export interface ApiUser {
  uuid: string;
  username: string;
  displayName: string;
  avatar: Media;
}

export type Me = ApiUser;
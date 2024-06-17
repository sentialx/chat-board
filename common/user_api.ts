import { Me, User, UserPost } from "./user";

export class GetMeRequest {}

export type GetMeResponse = Me;

export class GetUserRequest {}

export type GetUserResponse = User;

export type GetUserPostsRequest = {
  uuid: string;
  offset?: number;
  limit?: number;
};

export type GetUserPostsResponse = UserPost[];


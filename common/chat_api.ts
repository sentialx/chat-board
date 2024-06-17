import {
  IsBase64,
  IsNumber,
  IsOptional,
  IsString,
  isString,
} from "class-validator";

import {
  ChatEvent,
  ChatMediaEvent,
  ChatMessageEvent,
  ChatThread,
} from "./chat";

export class GetChatThreadsRequest {}

export type GetChatThreadsResponse = ChatThread[];

export type GetChatThreadWithUserResponse = ChatThread;

export interface GetChatThreadWithUserRequest {
  userUuid: string;
  workspaceUuid: string;
}

export class GetChatEventsRequest {
  @IsNumber()
  limit!: number;

  @IsNumber()
  @IsOptional()
  before?: number;
}

export interface GetChatEventsResponse {
  events: ChatEvent[];
  hasMore: boolean;
}

export class SendChatMessageRequest {
  @IsString()
  text!: string;

  @IsString()
  deviceId?: string;
}

export class SendChatMediaRequest {
  @IsString()
  deviceId?: string;
}

export interface SendChatMessageResponse {
  event: ChatMessageEvent;
}

export interface SendChatMediaResponse {
  event: ChatMediaEvent;
}

export class ChatEventsSseRequest {}

export type ChatEventsSseResponse = {
  events: ChatEvent[];
  deviceId?: string;
};

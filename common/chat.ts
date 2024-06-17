import { Media } from "./media";

export interface ChatThread {
  uuid: string;
  picture?: Media;
  title: string;
  lastEvent?: ChatEvent;
  participants: string[];
  lastActivityAt: number;
  isGroup: boolean;
  reads: ChatThreadReads;
  workspaceUuid: string;
}

export type ChatThreadReads = {
  [userUuid: string]: number;
};

export interface BaseChatEvent {
  type: ChatEventType;
  uuid: string;
  threadUuid: string;
  createdAt: number;
}

interface WithSender {
  senderUuid: string;
}

export interface ChatMessageEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Message;
  data: string;
}

export interface ChatMediaEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Media;
  data: string;
}

export interface ChatTypingEvent extends BaseChatEvent, WithSender {
  type: ChatEventType.Typing;
  data: boolean;
}

export interface ChatInfoEvent extends BaseChatEvent {
  type: ChatEventType.Info;
  data: string;
}

export interface ChatReadEvent extends BaseChatEvent {
  type: ChatEventType.Read;
  data: {
    userUuid: string;
    readAt: number;
  };
}

export type ChatEvent =
  | ChatMessageEvent
  | ChatMediaEvent
  | ChatTypingEvent
  | ChatInfoEvent
  | ChatReadEvent;

export type ChatEventData = ChatEvent["data"];

export enum ChatEventType {
  Message = 0,
  Media = 1,
  PremiumMedia = 2,
  Info = 3,
  Typing = 4,
  PremiumMediaUnlock = 5,
  Read = 6,
}

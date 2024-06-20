import { action, computed, makeObservable, observable } from "mobx";
import Router from "next/router";
import { createRef } from "react";

import { THREADS_ROUTE } from "../constants/routes";

import { ApiClient } from "./api_client";
import { AppStore } from "./app_store";

import {
  ChatThread,
  ChatEvent as ApiChatEvent,
  ChatEventsSseResponse,
  ChatEventType,
  ChatPremiumMediaEvent,
  ChatInfoEvent as ApiChatInfoEvent,
  ChatMessageEvent,
  ChatMediaEvent,
  GetChatThreadWithUserRequest,
  GetChatThreadWithUserResponse,
  ApiUser,
} from "~/common";
import { AxiosResponse } from "axios";
import { readBrowserFile } from "~/common/js/fs";
import { randomString } from "~/common/js/random";
import { formatDateShortHeader, hoursToMs } from "~/common/js/time";
import { asArray, filterNullable } from "~/common/js/array";
import { clearInput } from "~/common/js/dom";

export type ChatEventStatus = "sending" | "sent";

export type ChatEvent = ApiChatEvent & {
  $showAvatar?: boolean;
  $isOwn?: boolean;
  $local?: boolean;
  $status?: ChatEventStatus;
  $readBy?: string[];
};

export interface ChatController {
  content: ApiChatEvent[];
  contentRef: React.RefObject<HTMLDivElement>;
  isContentVisible: boolean;
  isLoading: boolean;
  isGuest: boolean;
  onScroll(): void;
  canRender: boolean;
  receivers: ApiUser[];
}

export class ChatStore implements ChatController {
  public data: ChatThread | undefined = undefined;
  public events: ChatEvent[] = [];
  public eventUuids = new Set<string>();
  public eventSource: EventSource | undefined = undefined;
  public isLoading = true;
  public hasMoreEvents = true;
  public userInputRef = createRef<HTMLInputElement>();
  public contentRef = createRef<HTMLDivElement>();
  public bottomBarRef = createRef<HTMLDivElement>();
  public isContentVisible = false;
  public isEmojiButton = true;
  public isGuest = false;

  constructor(
    private readonly appStore: AppStore,
    private readonly apiClient: ApiClient,
  ) {
    makeObservable(this, {
      data: observable,
      events: observable,
      isLoading: observable,
      hasMoreEvents: observable,
      isContentVisible: observable,
      canRender: computed,
      content: computed,
      title: computed,
      subTitle: computed,
      load: action,
      loadMessages: action,
      onSseEvent: action,
      sendEvent: action,
      addEvents: action,
      isEmojiButton: observable,
      onUserInputChange: action,
    });
  }

  public get oldestEvent(): ApiChatEvent | undefined {
    return this.events[0];
  }

  public get canRender(): boolean {
    return !!this.data;
  }

  public clearUserInput(): void {
    clearInput(this.userInputRef?.current);
    this.isEmojiButton = true;
  }

  public get userInput(): string {
    return this.userInputRef.current?.value ?? "";
  }

  public get userInputEmpty(): boolean {
    return this.userInput.length === 0;
  }

  public focusUserInput(immediate = false): void {
    if (immediate) {
      this.userInputRef.current?.focus();
      return;
    }
    requestAnimationFrame(() => {
      this.userInputRef.current?.focus();
    });
  }

  public get receivers(): ApiUser[] {
    const meUuid = this.apiClient.me?.uuid;
    if (this.data == null || meUuid == null) return [];
    const uuids = this.data.participants.filter((r) => r !== meUuid);
    return filterNullable(uuids.map((uuid) => this.apiClient.users.get(uuid)));
  }

  public get title(): string | undefined {
    return this.data?.title;
  }

  public get subTitle(): string | undefined {
    if (this.data == null) return undefined;
    if (this.data.isGroup) return this.data.title;
    const users = this.receivers;
    return users.map((r) => r.username).join(", ");
  }

  public async load(threadUuid: string): Promise<void> {
    if (this.data?.uuid === threadUuid) {
      this.scrollToBottom();
      return;
    }

    this.isContentVisible = false;
    this.isLoading = true;
    this.eventSource?.close();
    this.eventSource?.removeEventListener("message", this.onSseEvent);
    this.events = [];
    this.eventUuids = new Set<string>();
    this.hasMoreEvents = true;

    const data = await this.apiClient.getChatThread(threadUuid);
    this.data = data;

    if (!data) {
      return;
    }

    this.appStore.workspaceStore.select(data.workspaceUuid);

    await this.loadMessages();

    for (let i = 0; i < 16; i++) {
      const scrollTop = this.contentRef.current?.scrollTop ?? 0;
      if (scrollTop != 0) break;
      await this.loadMessages();
    }

    this.scrollToBottom();

    this.eventSource = this.apiClient.createChatEventsObserver({
      threadUuid: data.uuid,
    });
    this.eventSource.addEventListener("message", this.onSseEvent);

    this.isContentVisible = true;
  }

  public async addEvents(events: ChatEvent | ChatEvent[]): Promise<void> {
    if (process.env["NODE_ENV"] === "development") {
      console.log(events);
    }
    if (this.data == null) return;
    events = asArray(events);

    const notLocal = events.filter((r) => !r.$local);

    const promises: Promise<any>[] = [
      ...notLocal
        .filter((r) => r.type === ChatEventType.Media)
        .map((r) => (r as ChatMediaEvent).data)
        .map((r) => this.apiClient.getMedia(r)),
    ];

    for (const e of events) {
      if (e.type === ChatEventType.Typing) {
        this.apiClient.setUserTypingStatus(e.senderUuid, e.data);
        continue;
      }
      if (e.type === ChatEventType.Read) {
        this.apiClient.setChatReadStatus(
          e.threadUuid,
          e.data.userUuid,
          e.data.readAt,
        );
        continue;
      }

      if (this.eventUuids.has(e.uuid)) {
        const index = this.events.findIndex((r) => r.uuid === e.uuid);
        this.events[index] = e;
      } else {
        this.events.push(e);
        this.events.sort((a, b) => a.createdAt - b.createdAt);
      }
      this.eventUuids.add(e.uuid);
    }

    promises.push(this.apiClient.getUsers(this.data.participants));

    await Promise.all(promises);

    this.tryToScrollToBottom();
  }

  public onSseEvent = async ({ data }: any): Promise<void> => {
    const e = JSON.parse(data) as ChatEventsSseResponse;
    if (process.env["NODE_ENV"] === "development") {
      console.log(
        e.deviceId != null && this.apiClient.deviceId === e.deviceId,
        e,
      );
    }
    if (e.deviceId != null && this.apiClient.deviceId === e.deviceId) return;
    this.addEvents(e.events);
  };

  public get content(): ApiChatEvent[] {
    const meUuid = this.apiClient.me?.uuid;
    if (this.data == null || this.data.participants == null || meUuid == null) {
      return [];
    }

    const eventGroups: ChatEvent[] = [];
    let lastEventTime: Date | undefined = undefined;
    let lastSenderUuid: string | undefined = undefined;

    for (let i = 0; i < this.events.length; i++) {
      const e = this.events[i];
      const nextE = this.events[i + 1];

      const eventTime = new Date(e.createdAt);
      const isWithinOneHour =
        lastEventTime &&
        Math.abs(eventTime.getTime() - lastEventTime.getTime()) <= hoursToMs(1);

      if (!lastEventTime || !isWithinOneHour) {
        lastEventTime = eventTime;
        eventGroups.push({
          uuid: e.uuid + "divider",
          threadUuid: e.threadUuid,
          type: ChatEventType.Info,
          data: formatDateShortHeader(eventTime),
          createdAt: eventTime.getTime(),
        } as ApiChatInfoEvent);
      }

      if (
        [ChatEventType.Info, ChatEventType.PremiumMediaUnlock].includes(e.type)
      ) {
        eventGroups.push(e);
        continue;
      }

      if (
        e.type === ChatEventType.Message ||
        e.type === ChatEventType.Media ||
        e.type === ChatEventType.PremiumMedia
      ) {
        const isOwn = e.senderUuid === meUuid;
        const isLastMessage =
          i === this.events.length - 1 ||
          nextE == null ||
          !("senderUuid" in nextE) ||
          nextE.senderUuid !== e.senderUuid ||
          !isWithinOneHour;
        const showAvatar = !isOwn && isLastMessage;

        eventGroups.push({
          ...e,
          $showAvatar: showAvatar,
          $isOwn: isOwn,
        });

        lastSenderUuid = e.senderUuid;
      }
    }

    this.data.participants
      .filter((participantUuid) => participantUuid !== meUuid)
      .forEach((participantUuid) => {
        if (this.apiClient.isUserTyping(participantUuid)) {
          eventGroups.push({
            uuid: participantUuid + "typing",
            threadUuid: this.data?.uuid ?? randomString(),
            type: ChatEventType.Typing,
            senderUuid: participantUuid,
            $showAvatar: true,
            createdAt: Date.now(),
            data: true,
          });
        }
      });

    const alreadyRead = new Set<string>();

    for (let i = eventGroups.length - 1; i >= 0; i--) {
      const e = eventGroups[i];
      if ([ChatEventType.Message, ChatEventType.Media].includes(e.type)) {
        if (e.$isOwn) {
          let status: ChatEventStatus | undefined = undefined;
          const readBy: string[] = [];

          const reads = this.data.reads;
          for (const [key, value] of Object.entries(reads)) {
            if (value == null) continue;
            if (alreadyRead.has(key)) continue;
            if (value < e.createdAt) continue;
            readBy.push(key);
            alreadyRead.add(key);
          }

          if (readBy.length === 0 && alreadyRead.size === 0) {
            status = e.$local ? "sending" : "sent";
          }

          eventGroups[i] = {
            ...e,
            $status: status,
            $readBy: readBy,
          };
        }
      }
    }

    return eventGroups;
  }

  public tryToScrollToBottom(): void {
    if (this.isScrollNearBottom()) {
      this.scrollToBottom();
    }
  }

  public scrollToBottom(animate = false): void {
    setTimeout(() => {
      if (this.contentRef.current == null) return;
      if (animate) {
        this.contentRef.current.scrollTo({
          top: this.contentRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        this.contentRef.current.scrollTo({
          top: this.contentRef.current.scrollHeight,
          behavior: "instant",
        });
      }
    }, 50);
  }

  public isScrollNearBottom(threshold = 256): boolean {
    if (this.contentRef.current == null) return true;
    const { scrollHeight, scrollTop, clientHeight } = this.contentRef.current;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }

  public isScrollNearTop(threshold = 256): boolean {
    if (this.contentRef.current == null) return true;
    const { scrollTop } = this.contentRef.current;
    return scrollTop < threshold;
  }

  public async sendEvent(
    opts: { type: ChatEventType } & (
      | { type: ChatEventType.Message; text: string }
      | { type: ChatEventType.Media; file: File }
    ),
    { focusInput }: { focusInput?: boolean } = {},
  ): Promise<void> {
    const me = this.apiClient.me;
    if (this.data == null || me == null) return;

    if (opts.type === ChatEventType.Message && focusInput) {
      this.focusUserInput(true);
    }

    this.clearUserInput();
    this.scrollToBottom();

    console.log(`Sending: ${opts}`);

    const createLocal = async <T extends ChatEvent = ChatEvent>(
      _e: T,
    ): Promise<T> => {
      _e.$local = true;
      await this.addEvents(_e);
      return _e;
    };

    const updateLocal = async (
      res: ApiChatEvent,
      local: ChatEvent,
    ): Promise<void> => {
      if (res != null) {
        const index = this.events.findIndex((r) => r.uuid === local.uuid);
        if (index != -1) {
          this.events[index] = res;
          this.eventUuids.add(res.uuid);
        }
      }
      this.apiClient.medias.delete(local.uuid);
      await this.addEvents(res);
    };

    let localEvent = {
      uuid: randomString(),
      threadUuid: this.data.uuid,
      type: opts.type,
      createdAt: Date.now(),
    } as ApiChatEvent;
    switch (opts.type) {
      case ChatEventType.Message: {
        localEvent = {
          ...localEvent,
          senderUuid: me.uuid,
          data: opts.text,
        } as ChatMessageEvent;
        await createLocal(localEvent);
        const res = await this.apiClient.sendChatMessage({
          threadUuid: this.data.uuid,
          text: opts.text,
        });
        await updateLocal(res.event, localEvent);
        break;
      }
      case ChatEventType.Media: {
        localEvent = {
          ...localEvent,
          senderUuid: me.uuid,
          data: localEvent.uuid,
        } as ChatMediaEvent;
        const base64 = await readBrowserFile(opts.file);
        await createLocal(localEvent);
        this.apiClient.medias.set(localEvent.uuid, {
          url: base64,
        });
        const res = await this.apiClient.sendChatMedia({
          threadUuid: this.data.uuid,
          file: opts.file,
        });
        await updateLocal(res.event, localEvent);
        break;
      }
    }

    await this.addEvents([{ ...localEvent, $local: true }]);
  }

  public async loadMessages(limit = 20): Promise<void> {
    if (!this.hasMoreEvents) return;
    if (this.data == null) return;
    console.log(`Loading messages: ${limit} | Current: ${this.events.length}`);
    this.isLoading = true;

    const { events, hasMore } = await this.apiClient.getChatEvents({
      threadUuid: this.data.uuid,
      limit,
      before: this.oldestEvent?.createdAt,
    });
    this.hasMoreEvents = hasMore;
    await this.addEvents(events);
    this.isLoading = false;
  }

  public async sendMessage(text: string): Promise<void> {
    await this.sendEvent(
      { type: ChatEventType.Message, text },
      { focusInput: true },
    );
  }

  public async sendHeart(): Promise<void> {
    await this.sendEvent({ type: ChatEventType.Message, text: `❤️` });
  }

  public onScroll(): void {
    if (!this.contentRef.current) return;
    if (this.isScrollNearTop() && !this.isLoading) this.loadMessages();
  }

  public onUserInputChange(): void {
    if (!this.userInputRef.current) return;
    const isEmoji = this.userInputEmpty;
    if (isEmoji !== this.isEmojiButton) {
      this.isEmojiButton = isEmoji;
    }
  }

  public onUserInputKeyUp(): void {
    if (!this.userInputRef.current) return;
    // let text = this.userInput;
    // const map = {
    //   ";)": "😉",
    // };
    // for (const [key, value] of Object.entries(map)) {
    //   text = text.replaceAll(key, value);
    // }
    // this.userInputRef.current.value = text;
  }

  public async onFilesChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const { files } = e.target;
    if (files == null) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await this.sendEvent({ type: ChatEventType.Media, file });
    }
  }

  public async getThreadWithUser(
    userUuid: string,
  ): Promise<ChatThread | undefined> {
    const { selected } = this.appStore.workspaceStore;
    if (!selected) return;

    const { data: thread } = await this.apiClient.client.get<
      GetChatThreadWithUserRequest,
      AxiosResponse<GetChatThreadWithUserResponse>
    >("/chat/user", {
      params: { userUuid, workspaceUuid: selected.uuid },
    });
    if (!thread) return;

    return thread;
  }
}

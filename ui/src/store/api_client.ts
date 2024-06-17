import axios, { AxiosInstance, AxiosResponse } from "axios";
import { action, computed, makeObservable, observable } from "mobx";
import Router from "next/router";

import { AppStore } from "./app_store";

import {
  GetMeRequest,
  GetMeResponse,
  GetChatThreadsRequest,
  GetChatThreadsResponse,
  ChatThread,
  SendChatMessageRequest,
  SendChatMessageResponse,
  GetChatEventsResponse,
  GetChatEventsRequest,
  SendChatMediaResponse,
  SendChatMediaRequest,
  Media,
  GetMediaResponse,
  GetMediaRequest,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
  ApiUser,
  Me,
} from "~/common";
import { EventEmitter, EventRegistry } from "~/common/js/events";
import { randomString } from "~/common/js/random";
import { asArray, unique } from "~/common/js/array";

export interface WithChatThreadUuid {
  readonly threadUuid: string;
}

export interface WithFile {
  readonly file: File;
}

export interface WithUuid {
  readonly uuid: string;
}

export type ApiClientEvents = Record<string, never>;

export interface User extends ApiUser {
  isTyping: boolean;
}

export class ApiClient extends EventRegistry<ApiClientEvents> {
  private readonly emitter = new EventEmitter<ApiClientEvents>(this);

  public readonly client: AxiosInstance;

  public me: Me | undefined = undefined;
  public users = new Map<string, User>();
  public chatThreads = new Map<string, ChatThread>();
  public medias = new Map<string, Media>();
  public readonly deviceId: string;
  public readonly userUuidToUserPostUuids = new Map<string, Set<string>>();

  constructor(private readonly appStore: AppStore) {
    super();
    this.deviceId = randomString();
    makeObservable(this, {
      isAuthenticated: computed,
      me: observable,
      medias: observable,
      sendChatMessage: action,
      users: observable,
      getUsers: action,
      setUserTypingStatus: action,
      chatThreads: observable,
      getChatThreads: action,
      getMedia: action,
      setChatReadStatus: action,
      userUuidToUserPostUuids: observable,
    });
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": this.deviceId,
      },
    });
    this.client.interceptors.request.use((config) => {
      const referer = this.referer;
      if (referer != null) {
        config.headers ??= {};
        config.headers["blazeflow-referer"] = referer;
      }
      return config;
    });
  }

  public clearMeData(): void {
    this.me = undefined;
    this.users.clear();
    this.chatThreads.clear();
  }

  public async login(
    req: Partial<AuthLoginRequest>,
  ): Promise<AuthLoginResponse> {
    this.clearMeData();
    const { data: res } = await this.client.post<
      AuthLoginRequest,
      AxiosResponse<AuthLoginResponse>
    >(`/auth/login`, req);
    return res;
  }

  public handleAuthentication(): boolean {
    if (!this.isAuthenticated) {
      Router.push(`/auth?redirect=${Router.asPath}`);
      return false;
    }
    return true;
  }

  public async logout(): Promise<void> {
    this.clearMeData();
    const res = await this.client.get(`/auth/logout`);
    Router.push("/");
  }

  public async register(
    req: Partial<AuthRegisterRequest>,
  ): Promise<AuthRegisterResponse> {
    const { data: res } = await this.client.post<
      AuthRegisterRequest,
      AxiosResponse<AuthRegisterResponse>
    >(`/auth/register`, req);
    return res;
  }

  public get isAuthenticated(): boolean {
    return this.me != null;
  }

  public get apiBaseUrl(): string {
    console.log(process.env["API_URL"]);
    return process.env["API_URL"] as string;
  }

  public updateMe(me: Partial<Me>): void {
    this.me = { ...(this.me ?? {}), ...me } as Me;
    this.users.set(this.me.uuid, this.me as any);
    localStorage.setItem("me", JSON.stringify(this.me));
  }

  public get meLocalStorage(): Me | undefined {
    const me = localStorage.getItem("me");
    if (me == null) return undefined;
    return JSON.parse(me);
  }

  public async getMe(): Promise<void> {
    const res = await this.client.get<
      GetMeRequest,
      AxiosResponse<GetMeResponse>
    >("/me");
    this.updateMe(res.data);
  }

  public async getUsers(_uuid: string | string[]): Promise<Map<string, User>> {
    const uuids = unique(asArray(_uuid));
    const uuidsToFetch = uuids.filter((uuid) => !this.users.has(uuid));

    await Promise.all(
      uuidsToFetch.map(async (uuid) => {
        const { data } = await this.client.get<User>(`/users/${uuid}`);
        this.users.set(data.uuid, data);
        this.users.set(uuid, data);
      }),
    );

    const users = new Map<string, User>();
    for (const uuid of uuids) {
      users.set(uuid, this.users.get(uuid)!);
    }
    return users;
  }

  public async getChatThread(uuid: string): Promise<ChatThread> {
    if (!this.chatThreads.has(uuid)) {
      await this.getChatThreads();
    }
    return this.chatThreads.get(uuid)!;
  }

  public async getChatThreads(
    participantUuid?: string,
  ): Promise<Map<string, ChatThread>> {
    let url = "/chat/threads";
    if (participantUuid != null) {
      url += `/${participantUuid}`;
    }
    const { data } = await this.client.get<
      GetChatThreadsRequest,
      AxiosResponse<GetChatThreadsResponse>
    >(url);
    for (const thread of data) {
      this.chatThreads.set(thread.uuid, thread);
    }
    return this.chatThreads;
  }

  public async getChatEvents(
    req: GetChatEventsRequest & WithChatThreadUuid,
  ): Promise<GetChatEventsResponse> {
    return this.client
      .get<GetChatEventsRequest, AxiosResponse<GetChatEventsResponse>>(
        `/chat/thread/${req.threadUuid}/events`,
        { params: req },
      )
      .then((res) => res.data);
  }

  public async sendChatMessage(
    req: SendChatMessageRequest & WithChatThreadUuid,
  ): Promise<SendChatMessageResponse> {
    const { data: res } = await this.client.post<
      SendChatMessageRequest,
      AxiosResponse<SendChatMessageResponse>
    >(`/chat/thread/${req.threadUuid}/message`, {
      deviceId: this.deviceId,
      ...req,
    });
    if (process.env["NODE_ENV"] === "development") {
      if (req.text === "clear") {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
    return res;
  }

  public async sendChatMedia(
    req: SendChatMediaRequest & WithChatThreadUuid & WithFile,
  ): Promise<SendChatMediaResponse> {
    const formData = new FormData();
    formData.append("deviceId", this.deviceId);
    formData.append("media", req.file);
    const { data: res } = await this.client.post<
      SendChatMediaRequest,
      AxiosResponse<SendChatMediaResponse>
    >(`/chat/thread/${req.threadUuid}/media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  }

  public createChatEventsObserver(req: WithChatThreadUuid): EventSource {
    return new EventSource(
      `${this.apiBaseUrl}/chat/thread/${req.threadUuid}/sse`,
      {
        withCredentials: true,
      },
    );
  }

  public async getMedia(uuid: string): Promise<GetMediaResponse> {
    const { data: res } = await this.client.get<
      GetMediaRequest,
      AxiosResponse<GetMediaResponse>
    >(`/media/info/${uuid}`);
    this.medias.set(uuid, res.media);
    return res;
  }

  public setUserTypingStatus(uuid: string, isTyping: boolean): void {
    const user = this.users.get(uuid);
    if (user != null) {
      user.isTyping = isTyping;
    }
  }

  public isUserTyping(uuid: string): boolean {
    return this.users.get(uuid)?.isTyping ?? false;
  }

  public setChatReadStatus(
    chatThreadUuid: string,
    userUuid: string,
    readAt: number,
  ): void {
    const chatThread = this.chatThreads.get(chatThreadUuid);
    if (chatThread == null) return;
    chatThread.reads[userUuid] = readAt;
  }
}

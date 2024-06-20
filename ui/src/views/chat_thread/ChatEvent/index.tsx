import { observer } from "mobx-react";
import { useCallback, useMemo, useState } from "react";

import { useStore } from "../../../store/app_store_provider";
import { ChatEvent as IChatEvent } from "../../../store/chat_store";

import {
  UserAvatar,
  StyledBody,
  Text,
  BodyContainer,
  TypingBlock,
  StyledChatEvent,
  StyledImageBlock,
  TextDivider,
  SendIndicator,
  IndicatorContainer,
  ReadIndicator,
} from "./style";

import {
  ChatMediaEvent as ApiChatMediaEvent,
  ChatMessageEvent as ApiChatMessageEvent,
  ChatEventType,
} from "~/common";

const Emojify = ({ children }: { children: string }) => {
  // return emoji.emojify(children);
  return children;
  // const _children = useMemo(() => {
  //   return emojify(children);
  // }, [children]);
  // return <>{_children}</>;
};

const MediaBlock = observer(({ event }: { event: ApiChatMediaEvent }) => {
  const { data } = event;
  const store = useStore();
  const media = store.apiClient.medias?.get(data);
  const onClick = useCallback(() => {
    if (media == null) return;
    store.mediaPopup.open(media);
  }, [media]);
  return (
    <StyledImageBlock>
      <img src={media?.url} draggable={false} onClick={onClick} />
    </StyledImageBlock>
  );
});

const MessageBlock = ({
  event,
}: {
  event: ApiChatMessageEvent & { $isOwn?: boolean };
}) => {
  const { data } = event;
  return (
    <Text isOwn={event.$isOwn}>
      {data.split("\n").map((line, i) => (
        <p key={i}>
          <Emojify>{line}</Emojify>
        </p>
      ))}
    </Text>
  );
};

const Body = observer(({ event }: { event: IChatEvent }) => {
  let child = null;

  switch (event.type) {
    case ChatEventType.Message: {
      child = <MessageBlock event={event} />;
      break;
    }
    case ChatEventType.Media: {
      child = <MediaBlock event={event} />;
      break;
    }
  }

  return <StyledBody isOwn={event.$isOwn}>{child}</StyledBody>;
});

export interface ChatEventProps extends React.HTMLAttributes<HTMLDivElement> {
  event: IChatEvent;
}

export const ChatEvent = observer(({ event, ...props }: ChatEventProps) => {
  const { type, data, $showAvatar, $isOwn, $status, $readBy } = event;
  const store = useStore();
  const user = store.apiClient.users.get((event as any).senderUuid);
  if (type === ChatEventType.Info) return <TextDivider>{data}</TextDivider>;

  const readByUser =
    $readBy?.length === 1 ? store.apiClient.users.get($readBy[0]) : undefined;

  return (
    <StyledChatEvent isOwn={$isOwn}>
      {$isOwn && (
        <IndicatorContainer>
          {$status != null && (
            <SendIndicator isSending={$status === "sending"} />
          )}
          {readByUser != null && (
            <ReadIndicator
              style={{
                backgroundImage: asUrl(readByUser.avatar.url ?? ""),
              }}
            />
          )}
        </IndicatorContainer>
      )}
      {user != null && !$isOwn && (
        <UserAvatar
          src={
            $showAvatar && user?.avatar?.url != null
              ? user.avatar.url
              : undefined
          }
          hideSkeleton={!$showAvatar}
          draggable={false}
        />
      )}
      <BodyContainer>
        {type === ChatEventType.Typing ? (
          <TypingBlock>
            <div />
            <div />
            <div />
          </TypingBlock>
        ) : (
          <Body event={event} />
        )}
      </BodyContainer>
    </StyledChatEvent>
  );
});

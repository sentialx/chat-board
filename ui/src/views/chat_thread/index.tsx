import { observer } from "mobx-react";

import { useStore } from "../../store/app_store_provider";
import { ChatController } from "../../store/chat_store";

import { BottomBar } from "./BottomBar";
import { ChatEvent } from "./ChatEvent";
import { ChatItems, StyledView } from "./style";

interface Props {
  chat: ChatController;
}

export const ChatThreadView = observer(({ chat }: Props) => {
  const store = useStore();

  return (
    <StyledView>
      {chat.canRender && (
        <>
          <ChatItems
            ref={chat.contentRef}
            $visible={chat.isContentVisible}
            onScroll={chat.onScroll.bind(chat)}
          >
            {chat.content.map((event) => (
              <ChatEvent key={event.uuid} event={event} />
            ))}
          </ChatItems>
          <BottomBar disabled={chat.isGuest} />
        </>
      )}
    </StyledView>
  );
});

import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { useStore } from "../../../store/app_store_provider";

import {
  ActionButton,
  Container,
  FacebookIcon,
  GoogleIcon,
  Input,
  LoginButton,
  LoginPromo,
  LoginPromoArrow,
  LoginPromoTitle,
  StyledBottomBar,
  UploadImageButton,
} from "./style";

interface Props {
  disabled?: boolean;
}

const OAUTH_ENABLED = false;

export const BottomBar = observer(({ disabled }: Props) => {
  const store = useStore();
  const chatStore = store.chatStore;

  const onSubmit = useCallback(() => {
    if (!chatStore.userInputEmpty) {
      chatStore.sendMessage(chatStore.userInput);
    }
  }, []);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSubmit();
      }
    },
    [onSubmit],
  );

  return (
    <StyledBottomBar ref={store.chatStore.bottomBarRef}>
      <Container>
        {store.chatStore.isEmojiButton && (
          <UploadImageButton
            type="file"
            id="file"
            onChange={store.chatStore.onFilesChange.bind(store.chatStore)}
            accept="image/*"
            disabled={disabled}
          />
        )}
        <Input
          ref={chatStore.userInputRef}
          placeholder="Aa"
          onKeyDown={onInputKeyDown}
          onChange={store.chatStore.onUserInputChange.bind(store.chatStore)}
          onKeyUp={store.chatStore.onUserInputKeyUp.bind(store.chatStore)}
          disabled={disabled}
        />
        <ActionButton
          onClick={onSubmit}
          isSend={!store.chatStore.isEmojiButton}
          disabled={disabled}
        />
      </Container>
    </StyledBottomBar>
  );
});

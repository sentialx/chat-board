import { useState } from "react";
import { createPortal } from "react-dom";

import { PopupBackground, StyledPopup } from "./style";

import { VisibilityController } from "~/common/ui/types/visibility_controller";

interface Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VisibilityController {
  unmountWhenHidden?: boolean;
}

export const usePopupController = (): VisibilityController => {
  const [visible, setVisible] = useState(false);
  return { visible, setVisible };
};

export const getPopupProps = (controller: VisibilityController) => {
  return {
    visible: controller.visible,
    setVisible: controller.setVisible,
  };
};

export const Popup = ({
  children,
  visible,
  setVisible,
  unmountWhenHidden,
}: Props) => {
  const onBgClick = () => {
    setVisible(false);
  };

  const shouldRender = !unmountWhenHidden || (unmountWhenHidden && visible);

  return (
    shouldRender && (
      <StyledPopup $visible={visible}>
        <PopupBackground onClick={onBgClick} />
        {children}
      </StyledPopup>
    )
  );
};

import { styled } from "styled-components";
import { flexColumn } from "~/common/ui/mixins/box";

export const StyledBoardView = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
  gap: 8px;
  padding: 16px;
  max-width: 960px;
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 12px;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.08);
  padding: 4px;
  gap: 4px;
`;

export const AddTask = styled.div`
  display: flex;
  align-items: center;
  height: 72px;
  justify-content: center;
  border: 2px dashed white;
  opacity: 0.12;
  border-radius: 6px;
  cursor: pointer;
  font-size: 32px;

  &:hover {
    opacity: 0.3;
  }
`;

export const StyledTask = styled.div`
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  ${flexColumn};
  gap: 8px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const Roles = styled.div`
  display: flex;
  gap: 4px;
`;

export const Role = styled.div`
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
`;

import { observer } from "mobx-react";
import { use, useEffect, useState } from "react";

import { useStore } from "../../store/app_store_provider";

import {
  AddTask,
  ColumnHeader,
  Column,
  StyledBoardView,
  StyledTask,
  Roles,
  Role,
} from "./style";

import { RoleApi, TaskApi } from "~/eryk/licencjat/common";

export type BoardViewProps = React.HTMLAttributes<HTMLDivElement> & {};

interface TaskProps {
  task: TaskApi;
}

export const Task = (props: TaskProps) => {
  const store = useStore();

  const [roles, setRoles] = useState<RoleApi[]>([]);

  useEffect(() => {
    store.settingsStore
      .fetchRole(props.task.roleUuid)
      .then((role) => setRoles([role]));
  }, [props.task.roleUuid, store.settingsStore]);

  const handleClick = () => {
    store.editTaskPopup.open({ task: props.task });
  };

  return (
    <StyledTask onClick={handleClick}>
      {props.task.title}
      <Roles>
        {roles.map((x) => (
          <Role key={x.uuid}>{x.name}</Role>
        ))}
      </Roles>
    </StyledTask>
  );
};

export const BoardView = observer(({ ...props }: BoardViewProps) => {
  const store = useStore();

  useEffect(() => {
    store.taskStore.fetch();
  }, [store.taskStore, store.workspaceStore._selected]);

  return (
    <StyledBoardView {...props}>
      <Column>
        <ColumnHeader>To do</ColumnHeader>
        {store.taskStore.todoTasks.map((task) => (
          <Task key={task.uuid} task={task} />
        ))}
        <AddTask
          onClick={() => {
            store.editTaskPopup.open({ task: undefined });
          }}
        >
          +
        </AddTask>
      </Column>
      <Column>
        <ColumnHeader>In progress</ColumnHeader>
        {store.taskStore.inProgressTasks.map((task) => (
          <Task key={task.uuid} task={task} />
        ))}
      </Column>
      <Column>
        <ColumnHeader>Done</ColumnHeader>
        {store.taskStore.doneTasks.map((task) => (
          <Task key={task.uuid} task={task} />
        ))}
      </Column>
    </StyledBoardView>
  );
});

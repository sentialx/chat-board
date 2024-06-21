import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import { useStore } from "../../store/app_store_provider";
import { Input } from "../../views/auth/AuthSection/style";
import { MenuItemView } from "../Navigation";
import { StyledMenu } from "../Navigation/style";
import { Popover, PopoverContent } from "../Popover/Popover";
import { Popup, getPopupProps } from "../Popup";

import { StyledEditTaskPopup } from "./style";

import { TaskStatus } from "~/common/task_api";

interface AutocompleteOption {
  title: string;
  data: any;
}

interface InputAutocompleteProps
  extends React.HTMLAttributes<HTMLInputElement> {
  getOptions: (value: string) => AutocompleteOption[];
  onValueChange: (data: any) => void;
  value?: any;
}

export const InputAutocomplete = observer((props: InputAutocompleteProps) => {
  const store = useStore();

  const [value, setValue] = useState("");
  const [options, setOptions] = useState<AutocompleteOption[]>([]);

  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (props.value) {
      setValue(
        props.getOptions("").find((x) => x.data === props.value)?.title ?? "",
      );
    } else {
      setValue("");
    }
  }, [props, props.value]);

  const getOptionClickHandler = (option: AutocompleteOption) => {
    return () => {
      setValue(option.title);
      props.onValueChange(option.data);
      setOptions([]);
    };
  };

  return (
    <div>
      <Input
        {...props}
        value={value}
        onFocus={(e) => {
          setOptions(props.getOptions(e.target.value));
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setValue(e.target.value);
          setOptions(props.getOptions(e.target.value));
        }}
      />
      {focused && options.length > 0 && (
        <StyledMenu style={{ position: "absolute" }}>
          {options.map((data, i) => (
            <MenuItemView
              key={i}
              onMouseDown={getOptionClickHandler(data)}
              data={{
                text: data.title,
                type: "text",
              }}
            />
          ))}
        </StyledMenu>
      )}
    </div>
  );
});

export const EditTaskPopup = observer(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();

    const task = store.editTaskPopup.data?.task;

    const [title, setTitle] = useState(task?.title ?? "");
    const [roleUuid, setRoleUuid] = useState(task?.roleUuid ?? "");
    const [description, setDescription] = useState(task?.description ?? "");
    const [assigneeUuid, setAssigneeUuid] = useState<string | undefined>(
      task?.assigneeUuid ?? undefined,
    );
    const [status, setStatus] = useState(task?.status ?? TaskStatus.TODO);

    useEffect(() => {
      setTitle(task?.title ?? "");
      setRoleUuid(task?.roleUuid ?? "");
      setDescription(task?.description ?? "");
      setAssigneeUuid(task?.assigneeUuid ?? undefined);
      setStatus(task?.status ?? TaskStatus.TODO);
    }, [task]);

    const getRoleOptions = (value: string): AutocompleteOption[] => {
      return store.settingsStore.roles
        .filter((x) => x.name.toLowerCase().includes(value.toLowerCase()))
        .map((x) => ({
          title: x.name,
          data: x.uuid,
        }));
    };

    const getAssigneeOptions = (value: string): AutocompleteOption[] => {
      const users =
        store.workspaceStore.selected?.users
          .filter((x) =>
            x.displayName.toLowerCase().includes(value.toLowerCase()),
          )
          .map((x) => ({
            title: x.displayName,
            data: x.uuid,
          })) ?? [];

      users.push({
        title: "Unassigned",
        data: undefined as any,
      });
      return users;
    };

    const getStatusOptions = (value: string): AutocompleteOption[] => {
      return [
        {
          title: "To do",
          data: TaskStatus.TODO,
        },
        {
          title: "In progress",
          data: TaskStatus.IN_PROGRESS,
        },
        {
          title: "Done",
          data: TaskStatus.DONE,
        },
      ];
    };

    const isEditing = !!store.editTaskPopup.data?.task;

    return (
      <Popup {...getPopupProps(store.editTaskPopup)}>
        {store.editTaskPopup.visible && (
          <StyledEditTaskPopup>
            <h2>{isEditing ? "Edit" : "New"} task</h2>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <br />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
            <br />
            <InputAutocomplete
              placeholder="Role"
              value={roleUuid}
              getOptions={getRoleOptions}
              onValueChange={setRoleUuid}
            />
            <br />
            <InputAutocomplete
              placeholder="Assignee (Optional)"
              value={assigneeUuid}
              getOptions={getAssigneeOptions}
              onValueChange={setAssigneeUuid}
            />
            <br />
            <InputAutocomplete
              placeholder="Status"
              value={status}
              getOptions={getStatusOptions}
              onValueChange={setStatus}
            />
            <br />

            <button
              onClick={async () => {
                if (isEditing) {
                  await store.taskStore.update({
                    uuid: task!.uuid,
                    title,
                    description,
                    roleUuid,
                    assigneeUuid,
                    status,
                  });
                } else {
                  await store.taskStore.create({
                    title,
                    description,
                    roleUuid,
                    assigneeUuid,
                    status,
                  });
                }

                store.newWorkspacePopup.setVisible(false);
              }}
            >
              {isEditing ? "Save" : "Create"}
            </button>
          </StyledEditTaskPopup>
        )}
      </Popup>
    );
  },
);

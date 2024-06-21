import { ChildProcess, exec as nodeExec } from "child_process";
import { platform } from "node:os";

import { nodeTreeKill } from "./third_party/node_tree_kill";

export interface ExecOptions {
  command: string;
  args?: any[];
  env?: Record<string, any>;
  cwd?: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  signal?: string;
  exitCode: number;
}

export const flattenCommand = (command: string, args: any[] = []): string => {
  if (args.length === 0) return command;
  return `${command} ${args.join(" ")}`;
};

export const exec = (options: ExecOptions | string): Promise<ExecResult> => {
  const commandStr =
    typeof options === "string"
      ? options
      : `${options.command} ${options.args?.join(" ") ?? ""}`;
  return new Promise<ExecResult>((resolve) => {
    nodeExec(
      commandStr,
      {
        env: typeof options === "string" ? {} : (options.env as any),
        cwd: typeof options === "string" ? undefined : options.cwd,
      },
      (error, stdout, stderr) => {
        resolve({
          stdout,
          stderr,
          signal: error?.signal,
          exitCode: error?.code ?? 0,
        });
      },
    );
  });
};

export const killPid = async (pid: number, signal?: string): Promise<void> => {
  if (platform() === "win32") {
    await exec(`taskkill /pid ${pid} /T /F`);
    return;
  }
  await exec(`kill ${signal ?? "-9"} ${pid}`);
  // throw new Error("not implemented");

  // return new Promise((resolve, reject) => {
  //   nodeTreeKill(pid, signal, (err: any) => {
  //     if (err) {
  //       reject(err);
  //     } else {
  //       resolve();
  //     }
  //   });
  // });
};

export const killChild = async (child: ChildProcess): Promise<void> => {
  if (child.pid != null) {
    await killPid(child.pid);
  }
  child.unref();
  child.kill();
};

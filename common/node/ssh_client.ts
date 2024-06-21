import { ReadStream } from "fs";
import { Readable } from "stream";
import { promisify } from "util";

import * as chalk from "chalk";
import { Client, ClientChannel, SFTPWrapper } from "ssh2";

import { randomStringAsync } from "./random";
import { SshShell } from "./ssh_shell";

import { stripAnsi } from "~/common/js/ansi";
import { EventEmitter, EventRegistry } from "~/common/js/events";
import { tryParseInt } from "~/common/js/number";

export interface SshClientConfig {}

export const DEFAULT_SSH_CLIENT_CONFIG: Partial<{}> = {};

export interface SshClientConnectOptions {
  host: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface SshClientEvent {
  client: SshClient;
}

export type SshClientEvents = {};

export interface SshClientExecOptions {
  env?: Record<string, any>;
  escape?: boolean;
  trim?: boolean;
}

export interface SshClientExecResult {
  stdout: string;
  exitCode?: number;
  signal?: string;
  command?: string;
  _command?: string;
}

export const pipeContent = (content: string): string => {
  const base64 = Buffer.from(content).toString("base64");
  return `echo '${base64}' | base64 -d`;
};

export const formatExportEnv = (env: Record<string, any>): string => {
  return Object.entries(env)
    .map(([key, value]) => {
      return `export ${key}=$(${pipeContent(value.toString())});`;
    })
    .join("");
};

export type FileEncoding = "utf8" | "binary";

export class SshClient extends EventRegistry<SshClientEvents> {
  protected readonly eventEmitter = new EventEmitter<SshClientEvents>(this);

  public readonly config: SshClientConfig;

  public client: Client | undefined;

  protected sftpClient: SFTPWrapper | undefined;

  constructor(config: SshClientConfig) {
    super();
    this.config = {
      ...DEFAULT_SSH_CLIENT_CONFIG,
      ...config,
    };
  }

  public async connect(options: SshClientConnectOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const client = new Client();

      client.once("ready", (err) => {
        if (err) return reject(err);
        this.client = client;
        resolve();
      });

      client.connect({
        host: options.host,
        port: options.port || 22,
        username: options.username ?? "root",
        password: options.password ?? "",
      });
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.sftpClient?.end();
      this.client?.end();
      this.client = undefined;
      resolve();
    });
  }

  public get isConnected(): boolean {
    return this.client != null;
  }

  public assertConnected(): asserts this is {
    client: Client;
    clientChannel: ClientChannel;
  } {
    if (!this.isConnected) {
      throw new Error("SSH client is not connected");
    }
  }

  public async shell(): Promise<SshShell> {
    this.assertConnected();
    return new Promise<SshShell>((resolve, reject) => {
      this.client.shell((err, clientChannel) => {
        if (err) return reject(err);
        const shell = new SshShell(this, clientChannel);
        resolve(shell);
      });
    });
  }

  public async $(
    command: string,
    options: SshClientExecOptions = {},
  ): Promise<SshClientExecResult> {
    this.assertConnected();

    if (options.escape) command = `"${command}"`;
    const _command = `${formatExportEnv(options.env ?? {})}${command}`;

    return new Promise<SshClientExecResult>((resolve, reject) => {
      this.client.exec(_command, (err, stream) => {
        if (err) return reject(err);
        let stdoutBuffer = "";

        stream
          .on("data", (data: any) => {
            stdoutBuffer += data;
          })
          .stderr.on("data", (data) => {
            stdoutBuffer += data;
          });

        stream.on("close", (code: any, signal: any) => {
          let stdout = stdoutBuffer.toString();
          if (options.trim) stdout = stdout.trim();
          resolve({
            stdout,
            exitCode: code,
            signal,
            command,
            _command,
          });
        });
      });
    });
  }

  public async pwd(): Promise<string> {
    return this.$("pwd").then((res) => res.stdout.trim());
  }

  protected async getSftp(): Promise<SFTPWrapper> {
    this.assertConnected();
    if (!this.sftpClient) {
      this.sftpClient = await promisify(this.client.sftp).bind(this.client)();
    }
    return this.sftpClient;
  }

  public async writeFile(
    path: string,
    content: string | Buffer | Readable,
  ): Promise<void> {
    const sftpClient = await this.getSftp();
    const writeStream = sftpClient.createWriteStream(path);

    await new Promise<void>((resolve, reject) => {
      writeStream.once("error", reject);
      writeStream.once("close", resolve);

      if (typeof content === "string" || content instanceof Buffer) {
        writeStream.write(content);
      } else if (content instanceof Readable) {
        content.pipe(writeStream);
      } else {
        throw new Error("Invalid content type");
      }
    });

    // const encodedContent = Buffer.from(content).toString("ascii");
    // return await this.$(`echo ${encodedContent} | base64 -d > ${path}`);
    // const encodedContent = Buffer.from(content).toString("base64");
    // return await this.$(`echo ${encodedContent} | base64 -d > ${path}`);
  }

  public async readFile(path: string, encoding?: "binary"): Promise<Buffer>;
  public async readFile(path: string, encoding?: "utf8"): Promise<string>;
  public async readFile(
    path: string,
    encoding: FileEncoding = "binary",
  ): Promise<string | Buffer> {
    const sftpClient = await this.getSftp();
    const readStream = sftpClient.createReadStream(path);
    let buffer = Buffer.from("");
    await new Promise<void>((resolve, reject) => {
      readStream.once("error", reject);
      readStream.on("data", (chunk: any) => {
        buffer = Buffer.concat([buffer, chunk]);
      });
      readStream.once("close", () => {
        resolve();
      });
    });
    if (encoding === "utf8") return buffer.toString("utf-8");
    return buffer;

    // const result = await this.$(`cat "${path}" | base64`);
    // const base64 = result.stdout.trim();
    // const buffer = Buffer.from(base64, "base64");
    // if (encoding === "utf8") return buffer.toString("utf-8");
    // return buffer;
  }

  public async exists(path: string): Promise<boolean> {
    return this.$(`ls "${path}"`).then((res) => res.exitCode === 0);
  }

  public async readDir(path: string): Promise<string[]> {
    const result = await this.$(`ls -1 "${path}"`);
    return result.stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  public async isDirectory(path: string): Promise<boolean> {
    return this.$(`test -d "${path}"`).then((res) => res.exitCode === 0);
  }

  public async mkdir(path: string): Promise<SshClientExecResult> {
    return this.$(`mkdir -p "${path}"`);
  }

  public async waitForPort(
    port: number,
    timeout = 1000 * 10,
  ): Promise<SshClientExecResult> {
    return await this.$(`npx wait-port -t ${timeout} ${port}`);
  }

  public async killPort(port: number): Promise<void> {
    await this.$(`npx kill-port ${port}`);
  }
}

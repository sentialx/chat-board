import { Readable } from "stream";

import {
  extension as getExtensionForMimeType,
  contentType as getExtensionForContentType,
  extensions as contentTypeToExtension,
} from "mime-types";
import { ClientChannel } from "ssh2";

import { stripAnsi } from "../js/ansi";
import { tryParseInt } from "../js/number";

import { formatUniqueFilename, getExtension, hasExtension } from "./fs";
import { randomStringAsync } from "./random";
import {
  FileEncoding,
  SshClient,
  SshClientExecOptions,
  SshClientExecResult,
  formatExportEnv,
  pipeContent,
} from "./ssh_client";

import { randomString } from "~/common/js/random";
import { nullIfEmpty } from "~/common/js/string";

// SSH interactive shell
export class SshShell {
  protected _isOpen = true;

  constructor(
    public readonly ssh: SshClient,
    protected readonly clientChannel: ClientChannel,
  ) {}

  public get isOpen(): boolean {
    return (
      this.ssh.isConnected && !this.clientChannel?.destroyed && this._isOpen
    );
  }

  public assertOpen(): asserts this is {
    isOpen: true;
  } {
    if (!this.isOpen) {
      throw new Error("SSH shell is not open");
    }
  }

  public close(): void {
    this.clientChannel.end();
    this._isOpen = false;
  }

  public async $(
    command: string,
    options: Omit<SshClientExecOptions, "escape"> = {},
  ): Promise<SshClientExecResult> {
    this.ssh.assertConnected();

    return new Promise<SshClientExecResult>(async (resolve, reject) => {
      const [startUuid, endUuid, exitCodeUuid] = await Promise.all([
        randomStringAsync(32),
        randomStringAsync(32),
        randomStringAsync(32),
      ]);
      const encodedStartUuid = Buffer.from(startUuid).toString("base64");
      const encodedEndUuid = Buffer.from(endUuid).toString("base64");

      let _command = `${formatExportEnv(options.env ?? {})}${command}`;

      const commandBase64 = Buffer.from(_command).toString("base64");
      const bashDecodeStartUuid = `echo '${encodedStartUuid}' | base64 --decode`;
      const bashDecodeEndUuid = `echo '${encodedEndUuid}' | base64 --decode`;
      const bashDecodeCommand = `echo '${commandBase64}' | base64 --decode`;
      _command = `
  echo $(${bashDecodeStartUuid})
  eval $(${bashDecodeCommand})
  echo '${exitCodeUuid}'$?
  echo $(${bashDecodeEndUuid})`
        .trim()
        .split("\n")
        .map((r) => r.trim())
        .join(";")
        .trim();

      this.clientChannel.write(`${_command}\n`, (err) => {
        if (err) return reject(err);
        let stdout = "";

        const onData = (data: Buffer): void => {
          stdout += stripAnsi(data.toString());

          const startFirstIdx = stdout.indexOf(startUuid);
          const endFirstIdx = stdout.indexOf(endUuid);
          const exitCodeLastIdx = stdout.lastIndexOf(exitCodeUuid);

          if (
            startFirstIdx === -1 ||
            endFirstIdx === -1 ||
            exitCodeLastIdx === -1
          ) {
            return;
          }

          const exitCodeStr = stdout.slice(
            exitCodeLastIdx + exitCodeUuid.length,
            endFirstIdx,
          );
          const exitCode = tryParseInt(exitCodeStr);
          let res = stdout.slice(
            startFirstIdx + startUuid.length,
            exitCodeLastIdx,
          );
          const firstNewLineIdx = res.indexOf("\n");
          if (firstNewLineIdx !== -1) {
            res = res.slice(firstNewLineIdx + 1);
          }
          const lastNewLineIdx = res.lastIndexOf("\n");
          if (lastNewLineIdx !== -1) {
            res = res.slice(0, lastNewLineIdx);
          }
          const lastCarriageReturnIdx = res.lastIndexOf("\r");
          if (lastCarriageReturnIdx !== -1) {
            res = res.slice(0, lastCarriageReturnIdx);
          }

          if (options.trim) {
            res = res.trim();
          }

          this.clientChannel.removeListener("data", onData);
          resolve({ stdout: res, exitCode, command, _command });
        };

        this.clientChannel.addListener("data", onData);
      });
    });
  }

  public async cd(path: string): Promise<SshClientExecResult> {
    return this.$(`cd "${path}"`);
  }

  public async pwd(): Promise<string> {
    return this.$("pwd").then((res) => res.stdout.trim());
  }

  public async absolute(path: string): Promise<string> {
    return this.$(`readlink -f "${path}"`).then((res) => res.stdout.trim());
  }

  public async writeFile(
    path: string,
    content: string | Buffer | Readable,
  ): Promise<void> {
    path = await this.absolute(path);
    return this.ssh.writeFile(path, content);
  }

  public async readFile(path: string, encoding?: "binary"): Promise<Buffer>;
  public async readFile(path: string, encoding?: "utf8"): Promise<string>;
  public async readFile(
    path: string,
    encoding: FileEncoding = "binary",
  ): Promise<string | Buffer> {
    path = await this.absolute(path);
    return this.ssh.readFile(path, encoding as any);
  }

  public async exists(path: string): Promise<boolean> {
    path = await this.absolute(path);
    return this.ssh.exists(path);
  }

  public async readDir(path: string): Promise<string[]> {
    path = await this.absolute(path);
    return this.ssh.readDir(path);
  }

  public async isDirectory(path: string): Promise<boolean> {
    path = await this.absolute(path);
    return this.ssh.isDirectory(path);
  }

  public async mkdir(path: string): Promise<SshClientExecResult> {
    path = await this.absolute(path);
    return this.ssh.mkdir(path);
  }

  public async downloadUrlToFolder(
    url: string,
    folderPath: string,
  ): Promise<{ path: string; url: string; contentType?: string }> {
    if (!url.startsWith("http")) {
      if (url.startsWith("file:")) {
        url = url.replace("file:", "");
      }
      if (url.startsWith("//")) {
        url = url.replace("//", "");
      }
      if (!url.startsWith("/")) {
        const pwd = await this.pwd();
        url = `${pwd}/${url}`;
      }
      url = `file://${url}`;
    }

    await this.mkdir(folderPath);
    const curlHeaders = await this.$(`curl -s -I -X HEAD "${url}"`);
    const headers = ((res: string): Record<string, string> => {
      const lines = res.split("\n");
      const headers: Record<string, string> = {};
      for (const line of lines) {
        const [key, value] = line.split(": ").map((r) => r.trim());
        headers[key] = value;
      }
      return headers;
    })(curlHeaders.stdout);

    let filename: string | undefined = undefined;
    if (headers["content-disposition"] != null) {
      const match = headers["content-disposition"].match(/filename="(.+)"/);
      if (match != null) {
        filename = match[1];
      }
    }

    let fileExt: string | undefined = undefined;
    let contentType: string | undefined = headers["content-type"];

    if (fileExt == null && contentType != null) {
      contentType = contentType.split(";")[0].trim();
      fileExt = contentTypeToExtension[contentType]?.[0];
    }

    if (fileExt == null && filename != null) {
      fileExt = getExtension(filename);
    }

    if (fileExt == null && contentType != null) {
      fileExt = getExtensionForMimeType(contentType) || undefined;
    }

    if (filename == null) {
      const urlParts = url.split("/");
      if (urlParts.length > 0) {
        filename = urlParts[urlParts.length - 1];
        filename = filename.split("?")[0];

        if (fileExt == null && filename.includes(".")) {
          fileExt = getExtension(filename);
        }
      }
    }
    filename = nullIfEmpty(filename);

    if (filename == null) {
      filename = randomString(10);
    }

    if (fileExt != null && !hasExtension(filename, fileExt)) {
      filename = `${filename}.${fileExt}`;
    }

    const files = await this.readDir(folderPath);
    filename = formatUniqueFilename(filename, files);

    const path = `${folderPath}/${filename}`;

    const res = await this.$(`curl -o ${path} "${url}"`);
    if (res.exitCode) {
      throw new Error(`Failed to download url ${url}. ${res.stdout}`);
    }

    return { url, path, contentType };
  }

  public async waitForPort(
    port: number,
    timeout = 1000 * 10,
  ): Promise<SshClientExecResult> {
    return this.ssh.waitForPort(port, timeout);
  }

  public async killPort(port: number): Promise<void> {
    return this.ssh.killPort(port);
  }

  public async python(code: string): Promise<SshClientExecResult> {
    code = code.trim();
    return await this.$(`${pipeContent(code)} | python3 -i`);
  }

  public async python(code: string): Promise<SshClientExecResult> {
    code = code.trim();
    return await this.$(`${pipeContent(code)} | python3 -i`);
  }
}

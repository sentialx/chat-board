import { Browser, BrowserContext, Page, chromium } from "playwright";

import { Logger } from "~/common/js/logger";
import { SshClient } from "~/common/node/ssh_client";

export interface SshBrowserOptions {
  externalChromePort: number;
  internalChromePort: number;
  internalProxyPort: number;
}

export class SshBrowser {
  public browser: Browser | undefined;
  public page: Page | undefined;

  constructor(
    public readonly options: SshBrowserOptions,
    protected readonly ssh: SshClient,
    protected readonly logger?: Logger,
  ) {}

  public async findChromePath(): Promise<string | undefined> {
    const result = await this.ssh.$("which google-chrome");
    return result.exitCode == 0 ? result.stdout.trim() : undefined;
  }

  public async isChromeRunning(): Promise<boolean> {
    const result = await this.ssh.$("pgrep chrome");
    return result.exitCode === 0;
  }

  public async launchChrome(): Promise<void> {
    if (await this.isChromeRunning()) {
      return;
    }
    const chromePath = await this.findChromePath();
    if (!chromePath) {
      throw new Error("Chrome not found");
    }
    this.logger?.log(
      `Preparing chrome at port ${this.options.externalChromePort}/${this.options.internalProxyPort} and ${chromePath}`,
    );
    const args: string[] = [];
    const userDataDir = `/mnt/data/chrome/user`;
    await this.ssh.$(`rm -rf ${userDataDir}`);
    await this.ssh.mkdir(userDataDir);
    await this.ssh.$(`service dbus start`);
    this.ssh.$(`Xvfb -ac :99 -screen 0 1920x1080x16`);
    await this.ssh.killPort(this.options.internalChromePort);
    const remoteDebuggingPort = this.options.internalChromePort;
    args.push(`--no-sandbox`);
    args.push(`--disable-dev-shm-usage`);
    args.push(`--disable-gpu`);
    args.push(`--user-data-dir=${userDataDir}`);
    args.push(`--no-first-run`);
    args.push(`--disable-software-rasterizer`);
    args.push(`--disable-setuid-sandbox`);
    args.push(`--disable-extensions`);
    args.push(`--disable-background-networking`);
    args.push(`--disable-default-apps`);
    args.push(`--disable-sync`);
    args.push(`--disable-translate`);
    args.push(`--disable-notifications`);
    args.push(`--remote-debugging-port=${remoteDebuggingPort}`);
    args.push(`--remote-debugging-address=0.0.0.0`);
    this.logger?.log(
      `Launching chrome on port ${remoteDebuggingPort} with args ${args.join(
        " ",
      )}`,
    );
    this.ssh
      .$(`${chromePath} ${args.join(" ")}`, {
        env: {
          DISPLAY: ":99",
        },
      })
      .then((res) => {
        if (res.exitCode !== 0) {
          throw new Error(`Failed to launch chrome: ${res.stdout}`);
        }
      });
    this.logger?.log(
      `Waiting for chrome to start on port ${remoteDebuggingPort}`,
    );
    await this.ssh.waitForPort(remoteDebuggingPort);
    if (!(await this.isChromeRunning())) {
      throw new Error("Chrome failed to start");
    }
    this.logger?.log(`Chrome started at port ${remoteDebuggingPort}`);
    await this.ssh.killPort(this.options.internalProxyPort);
    this.ssh
      .$(
        `socat tcp-listen:${this.options.internalProxyPort},fork tcp:localhost:${remoteDebuggingPort}`,
      )
      .then((res) => {
        this.logger?.log(res);
        if (res.exitCode !== 0) {
          throw new Error(`Failed to launch socat: ${res.stdout}`);
        }
      });
    this.logger?.log(
      `Waiting for socat to start at port ${this.options.internalProxyPort}`,
    );
    await this.ssh.waitForPort(this.options.internalProxyPort);
    this.logger?.log(`Socat started at port ${this.options.internalProxyPort}`);
    this.logger?.log(`Chrome launched`);
  }

  public async killChrome(): Promise<void> {
    await this.ssh.$(`pkill chrome`);
    await this.ssh.killPort(this.options.internalProxyPort);
    await this.ssh.killPort(this.options.internalChromePort);
  }

  public async getBrowser(): Promise<Browser> {
    if (this.browser == null) {
      this.logger?.log("Chrome running", await this.isChromeRunning());
      const cdpUrl = `http://localhost:${this.options.externalChromePort}`;
      try {
        await this.launchChrome();
        this.browser = await chromium.connectOverCDP(cdpUrl);
      } catch (error) {
        await this.killChrome();
        await this.launchChrome();
        this.browser = await chromium.connectOverCDP(cdpUrl);
      }
    }

    return this.browser;
  }

  public async getBrowserContext(): Promise<BrowserContext> {
    const browser = await this.getBrowser();
    const ctx = browser.contexts()[0];
    if (ctx == null) {
      throw new Error("No browser context");
    }
    return ctx;
  }

  public async getPage(): Promise<Page> {
    const browser = await this.getBrowser();
    if (this.page == null) {
      this.page = await browser.newPage();
    }
    return this.page;
  }
}

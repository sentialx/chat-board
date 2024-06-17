import { writeFile } from "fs/promises";
import { resolve } from "path";

import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsString } from "class-validator";
import { mkdirs } from "~/common/node/fs";

import { ConfigService } from "./config_service";

class SaveRequest {
  @IsString()
  public data!: string;
}

@Controller("")
export class DebugApiController {
  constructor(private readonly configService: ConfigService) {}

  @Get("/version")
  public getVersion(): string {
    return "0.0.17";
  }

  @Post("/debug/save")
  public async save(@Body() data: SaveRequest): Promise<any> {
    // format date to dd-mm-yyyy hh:mm:ss
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    console.log(`Saving debug data to ${formattedDate}`);
    await mkdirs(resolve(this.configService.outPath, "debug"));
    const path = resolve(
      this.configService.outPath,
      "debug",
      `${formattedDate}`,
    );

    await writeFile(path, data.data);

    return {
      filename: formattedDate,
    };
  }
}

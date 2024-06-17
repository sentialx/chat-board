import {
  Controller,
  UseGuards,
  Param,
  Query,
  Get,
  ForbiddenException,
  Response,
  StreamableFile,
  Request,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";

import {
  GetMediaRequest,
  GetMediaResponse,
} from "../../common";
import { SessionUser } from "../auth/auth_decorators";
import { AuthGuard } from "../auth/auth_guard";
import { AuthService } from "../auth/auth_service";
import { ConfigService } from "../config_service";
import { UserEntity } from "../user/user_entity";

import { MediaService } from "./media_service";

@Controller("media")
export class MediaApiController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get("/info/:uuid")
  @UseGuards(AuthGuard)
  public async getMediaStatus(
    @Query() body: GetMediaRequest,
    @Param("uuid") uuid: string,
    @SessionUser() user: UserEntity,
  ): Promise<GetMediaResponse> {
    const mediaEntity = (await this.mediaService.fromUuid(uuid)).unwrap();
    return this.mediaService.asApiMedia(mediaEntity);
  }

  @Get("/view/:uuid")
  public async viewMedia(
    @Param("uuid") uuid: string,
    @Request() req: FastifyRequest,
    @Response({ passthrough: true }) res: FastifyReply,
  ): Promise<StreamableFile> {
    const media = (await this.mediaService.fromUuid(uuid)).unwrap();
    res.headers({
      "Content-Type": media.mimeType,
      "Cache-Control": `max-age=${60 * 60 * 24 * 7}`, // 7 days
    });
    const user = await this.authService.tryHandleJwtReq(req);
    const canAccess = await this.mediaService.canAccessMedia(media, user);
    if (!canAccess) throw new ForbiddenException();
    const stream = await this.mediaService.createMediaReadStream(media);
    return new StreamableFile(stream);
  }
}

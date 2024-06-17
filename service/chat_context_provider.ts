// import { Inject, Injectable, Logger } from "@nestjs/common";
// import OpenAI from "openai";

// import { randomString } from "../../common/js/random";
// import { createLoggerFromNest } from "../../common/nest/logger";
// import { writeJson } from "../../common/node/fs";
// import { Message } from "../common";

// import { ChatContext } from "./chat_context";
// import { ComfyService } from "./comfy_service";
// import { ComfyWorkflowProvider } from "./comfy_workflow_provider";
// import { ConfigService } from "./config_service";
// import { OPEN_AI_CLIENT_TOKEN } from "./openai_client_provider";

// @Injectable()
// export class ChatContextProvider {
//   private readonly logger = new Logger(ChatContextProvider.name);

//   private readonly ctxMap = new Map<string, ChatContext>();

//   constructor(
//     @Inject(OPEN_AI_CLIENT_TOKEN) private readonly openAiClient: OpenAI,
//     private readonly comfyService: ComfyService,
//     private readonly comfyWorkflowProvider: ComfyWorkflowProvider,
//   ) {}

//   public async getContext(id: string): Promise<ChatContext> {
//     if (this.ctxMap.has(id)) {
//       return this.ctxMap.get(id)!;
//     }

//     const ctx = new ChatContext(
//       id,
//       this.openAiClient,
//       createLoggerFromNest(this.logger),
//       this.comfyService,
//       this.comfyWorkflowProvider,
//     );
//     this.ctxMap.set(id, ctx);
//     return ctx;
//   }
// }

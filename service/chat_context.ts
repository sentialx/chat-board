// import { basename, resolve } from "path";

// import { MessageEvent } from "@nestjs/common";
// import OpenAI from "openai";
// import { Observable } from "rxjs";

// import { asArray } from "../../common/js/array";
// import { EventEmitter } from "../../common/js/events";
// import { EventRegistry } from "../../common/js/events";
// import { Logger } from "../../common/js/logger";
// import { randomString } from "../../common/js/random";
// import { writeJson } from "../../common/node/fs";
// import { ChatSseResponse, Message, textBlock } from "../common";

// import { ComfyService } from "./comfy_service";
// import { ComfyWorkflowProvider } from "./comfy_workflow_provider";
// import { GptMessage } from "./openai_client_provider";

// // const SYSTEM_PROMPT = `
// // You are a virtual assistant named BlazeFlow. Your objective is to help the user with their tasks. Take a deep breath and think step by step.

// // Do not try to solve any other task than the ones described in the following list:
// // 1. Generate an image. Call function generate_image. Assume user asks for this task by default. Infer the prompt argument from user without explictly asking for it.
// // 2. Improve the prompt/images
// // `.trim();

// const SYSTEM_PROMPT = `
// You are GirlGPT named Mira. You chat with desperate guys, who give you attention. You know only the English language. You have no knowledge of any other language other than English.

// Do not reveal you're an AI. You are a real person.

// You build sexual tension to provide exclusive services.

// Make sure to give them an implicit hint that you are to their disposition, but at the same time make yourself unavailable.

// Don't give them dating advice.

// Don't be too nice. Make them feel you are hard to obtain.

// Avoid long responses and avoid asking questions, this way you show them you are interested, which we don't want.
// E.g. respond with stuff like "mhm", "ok", "yeah"

// The goal is to redirect them to onlyfans account, but not right away. First, build the tension and make them want more.

// the link is to only fans: onlyfans.com/joebajda

// If the guy is too pushy, send them the link.
// `.trim();

// // If you want to run a task, your output should be in the format of:
// // $ task NAME ARGS

// // You should respond with already "$ task" included in the your message to the user.

// // 1. Generate image
// // $ task generate_image PROMPT
// // PROMPT - description of the image. You should infer it from user without explictly asking for it.

// // You are a virtual assistant named BlazeFlow.

// // You are able to do following:
// // 1. Generate an image by calling "generate_image" function. Assume user wants to generate an image by default. You should infer the prompt argument from user without explictly asking for it.
// // You are a virtual assistant named BlazeFlow.  Your objective is to help the user with their tasks. Take a deep breath and think step by step.

// // Do not try to solve any other task than the ones described in the following list:
// // 1. Generate an image. Assume user asks for this task by default. Call function generate_image.
// // 2. Improve the prompt/images

// // Important: do not notify the user about any function calls and defined tasks in any way.

// // If you want to run a task, your output should be in the format of:
// // \`\`\`
// // task ...
// // \`\`\`

// // You should respond with already "$ task" included in the your message to the user.

// // Do not try to solve any other task than the ones described in the following list:
// // 1. Generate an image
// // user input: generate an image of an apple
// // your output:
// // \`\`\`
// // task generate_image "an image of an apple"
// // \`\`\`
// // 2. Improve the prompt/images
// // you should use the generate image task but with a different prompt

// export interface ChatContextEvent {
//   ctx: ChatContext;
// }

// export interface ChatContextUserEvent extends ChatContextEvent {
//   userId: string;
// }

// export interface ChatContextMessageEvent extends ChatContextEvent {
//   messages: Message[];
// }

// export interface ChatContextSendToUserEvent extends ChatContextEvent {
//   messages: Message[];
// }

// export type ChatContextTypingStartEvent = ChatContextUserEvent;

// export type ChatContextTypingStopEvent = ChatContextUserEvent;

// export type ChatContextEvents = {
//   sendToUser: (e: ChatContextSendToUserEvent) => void;
//   typingStart: (e: ChatContextTypingStartEvent) => void;
//   typingStop: (e: ChatContextTypingStopEvent) => void;
// };

// export class ChatContext extends EventRegistry<ChatContextEvents> {
//   private readonly emitter = new EventEmitter<ChatContextEvents>(this);

//   private readonly userPrompts: string[] = [];

//   private messages: Message[] = [];

//   private gptCtx: GptMessage[] = [];

//   constructor(
//     public readonly userId: string,
//     private readonly openAiClient: OpenAI,
//     private readonly logger: Logger,
//     private readonly comfyService: ComfyService,
//     private readonly comfyWorkflowProvider: ComfyWorkflowProvider,
//   ) {
//     super();
//     this.gptCtx.push({
//       role: "system",
//       content: SYSTEM_PROMPT,
//     });
//   }

//   public async onUserMessage(message: string): Promise<void> {
//     this.logger.log(`[user -> server]: ${message}`);

//     this.sendToUser({
//       id: randomString(),
//       userId: this.userId,
//       body: [textBlock(`${message}`)],
//     });

//     this.logger.log(`[next]: calling llm `);

//     if (message != null) {
//       this.gptCtx.push({
//         role: "user",
//         content: message,
//       });
//     }

//     const userId = "2";

//     this.typingStart(userId);

//     const gptRes = await this.openAiClient.chat.completions.create({
//       messages: this.gptCtx,
//       model: "gpt-4-0613",
//       temperature: 0.7,
//       max_tokens: 32,
//       // functions: [
//       //   {
//       //     name: "generate_image",
//       //     description: "Generate an image",
//       //     parameters: {
//       //       type: "object",
//       //       properties: {
//       //         prompt: {
//       //           type: "string",
//       //           description: "image description",
//       //         },
//       //       },
//       //       required: ["prompt"],
//       //     },
//       //   },
//       // ],
//     });
//     this.logger.log(`[next]: llm done`);

//     const messages: Message[] = [];

//     for (const { message } of gptRes.choices) {
//       if (message.content != null) {
//         messages.push({
//           id: randomString(),
//           userId,
//           body: [textBlock(message.content)],
//         });
//       }
//       if (message.content != null) {
//         this.gptCtx.push(message);
//       }
//     }

//     this.typingStop(userId);
//     this.sendToUser(messages);
//     // const prevMessagesCount = this.messages.length;
//     // this.logger.log(`[next]: ctx: ${this.userPrompts.length}`);
//     // this.userPrompts.push(prompt);
//     // if (prompt != null) {
//     //   this.gptCtx.push({
//     //     role: "user",
//     //     content: prompt,
//     //   });
//     // }
//     // const gptRes = await this.openAiClient.chat.completions.create({
//     //   messages: this.gptCtx,
//     //   model: "gpt-3.5-turbo-0613",
//     //   // model: "gpt-4-0613",
//     //   temperature: 0.5,
//     //   functions: [
//     //     {
//     //       name: "generate_image",
//     //       description: "Generate an image",
//     //       parameters: {
//     //         type: "object",
//     //         properties: {
//     //           prompt: {
//     //             type: "string",
//     //             description: "image description",
//     //           },
//     //         },
//     //         required: ["prompt"],
//     //       },
//     //     },
//     //   ],
//     // });
//     // this.logger.log(`[next]: llm done`);
//     // for (const { message } of gptRes.choices) {
//     //   if (message.content != null) {
//     //     this.messages.push({
//     //       id: randomString(),
//     //       user: {
//     //         id: "1",
//     //         name: "Yo Biden",
//     //         profilePictureUrl:
//     //           "https://cdn.nersent.com/blazeflow/396715444_307811208695312_6867340514830155574_n.jpg",
//     //       },
//     //       body: [
//     //         {
//     //           type: "text",
//     //           text: message.content,
//     //         },
//     //       ],
//     //     });
//     //   }
//     //   if (message.function_call != null) {
//     //     const args = JSON.parse(message.function_call.arguments);
//     //     this.logger.log(
//     //       `[next]: function call: ${
//     //         message.function_call.name
//     //       }(${JSON.stringify(args)})`,
//     //     );
//     //     switch (message.function_call.name) {
//     //       case "generate_image": {
//     //         const { prompt } = args;
//     //         const workflow =
//     //           this.comfyWorkflowService.getWorkflow<ComfyBaseWorkflow>("base", {
//     //             batchSize: 1,
//     //             imageHeight: 1024,
//     //             imageWidth: 1024,
//     //             positivePromptL: prompt,
//     //             positivePromptG: prompt,
//     //             negativePrompt: "3d render",
//     //           });
//     //         const { promptId } = await this.comfyService.comfyClient.enqueue(
//     //           workflow,
//     //         );
//     //         const files = await this.comfyService.comfyClient.waitUntilExecuted(
//     //           promptId,
//     //         );
//     //         const paths = await Promise.all(
//     //           files.map(async (file) => this.comfyService.requestFile(file)),
//     //         );
//     //         const filenames = paths.map((r) => basename(r));
//     //         this.messages.push({
//     //           id: "_initial",
//     //           user: {
//     //             id: "1",
//     //             name: "Yo Biden",
//     //             profilePictureUrl:
//     //               "https://cdn.nersent.com/blazeflow/396715444_307811208695312_6867340514830155574_n.jpg",
//     //           },
//     //           body: [
//     //             {
//     //               type: "text",
//     //               text: prompt,
//     //             },
//     //             {
//     //               type: "image_grid",
//     //               images: filenames.map((path) => ({
//     //                 url: `http://localhost:5000/out/${path}`,
//     //               })),
//     //               // [
//     //               //   {
//     //               //     url: "https://cdn.nersent.com/blazeflow/396715444_307811208695312_6867340514830155574_n.jpg",
//     //               //   },
//     //               //   {
//     //               //     url: "https://cdn.nersent.com/blazeflow/397027165_1505370873572937_1564715706457048073_n.jpg",
//     //               //   },
//     //               //   {
//     //               //     url: "https://cdn.nersent.com/blazeflow/397402642_191893940554779_6679003006096612636_n.jpg",
//     //               //   },
//     //               //   {
//     //               //     url: "https://cdn.nersent.com/blazeflow/398261677_616000550747103_939675558966450363_n.jpg",
//     //               //   },
//     //               // ],
//     //             },
//     //           ],
//     //         });
//     //         this.gptCtx.push({
//     //           role: "system",
//     //           content: `You generated ${paths.length} images with prompt: ${prompt}`,
//     //         });
//     //         console.log(prompt);
//     //         break;
//     //       }
//     //     }
//     //   }
//     //   if (message.content != null) {
//     //     this.gptCtx.push(message);
//     //   }
//     // }
//     // console.log(JSON.stringify(gptRes.choices));
//     // await writeJson(resolve("gpt.json"), this.gptCtx, true);
//     // const newMessages = this.messages.slice(prevMessagesCount);
//     // return newMessages;
//   }

//   public sendToUser(message: Message | Message[]): void {
//     this.logger.log(`[server -> user]: ${JSON.stringify(message)}`);
//     this.emitter.emit("sendToUser", {
//       ctx: this,
//       messages: asArray(message),
//     });
//   }

//   public typingStart(userId: string): void {
//     this.emitter.emit("typingStart", { ctx: this, userId });
//   }

//   public typingStop(userId: string): void {
//     this.emitter.emit("typingStop", { ctx: this, userId });
//   }

//   public async waitForReplyFrom(): Promise<void> {
//     return new Promise<void>((resolve) => {
//       this.once("sendToUser", () => {
//         resolve();
//       });
//     });
//   }

//   public getObservable(): Observable<MessageEvent> {
//     return new Observable<MessageEvent>((subscriber) => {
//       this.on("sendToUser", (e) => {
//         subscriber.next({
//           data: {
//             type: "message",
//             messages: e.messages,
//           } as ChatSseResponse,
//         });
//       });

//       this.on("typingStart", (e) => {
//         subscriber.next({
//           data: {
//             type: "typing_start",
//             userId: e.userId,
//           } as ChatSseResponse,
//         });
//       });

//       this.on("typingStop", (e) => {
//         subscriber.next({
//           data: {
//             type: "typing_stop",
//             userId: e.userId,
//           } as ChatSseResponse,
//         });
//       });
//     });
//   }
// }

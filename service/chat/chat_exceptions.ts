import { HttpException, HttpStatus } from "@nestjs/common";

export class ChatThreadNoAccessException extends HttpException {
  constructor() {
    super("User cannot access the chat thread", HttpStatus.BAD_REQUEST);
  }
}

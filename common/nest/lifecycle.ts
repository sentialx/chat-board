export const run = async (delegate: () => Promise<void>): Promise<void> => {
  process.on("exit", () => {
    console.log("Process exited");
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.trace("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    console.trace("Uncaught Exception:", error);
    process.exit(1);
  });

  await delegate();
};

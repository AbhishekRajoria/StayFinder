// Vercel serverless entry point. Imports the Express app from src/app.ts and
// re-exports it as the default export for @vercel/node to dispatch.
import app from "../src/app";

export default app;

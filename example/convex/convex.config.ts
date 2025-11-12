import { defineApp } from "convex/server";
import reactions from "@convex/reactions/convex.config.js";

const app = defineApp();
app.use(reactions);

export default app;

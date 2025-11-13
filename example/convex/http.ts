import { httpRouter } from "convex/server";
import { reactions } from "./example.js";

const http = httpRouter();

/**
 * HTTP endpoint to get reaction counts for a target from the reactions component.
 * GET /reactions/getCounts?targetId=<targetId>&namespace=<namespace>
 *
 * This demonstrates how to expose component functionality via HTTP.
 */
export const getCounts = reactions.registerRoutes(http, {
  path: "/reactions/getCounts",
});

export default http;

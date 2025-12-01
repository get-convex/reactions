import { httpActionGeneric, type HttpRouter } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";
import type { CtxWith } from "./types.js";

// UseApi<typeof api> is an alternative that has jump-to-definition but is
// less stable and reliant on types within the component files, which can cause
// issues where passing `components.foo` doesn't match the argument

export class Reactions {
  constructor(
    public component: ComponentApi,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    public options?: {
      // Common parameters:
      // logLevel
    },
  ) {}

  /**
   * Add a reaction for a user on a target.
   * By default, any existing reactions by this user on this target+namespace will be removed first.
   * Set allowMultipleReactions to true to allow a user to have multiple different reactions on the same target.
   * This is idempotent - if the reaction already exists, it does nothing.
   */
  async add(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    label: string,
    userId: string,
    namespace?: string,
    allowMultipleReactions?: boolean,
  ) {
    return ctx.runMutation(this.component.lib.add, {
      targetId,
      label,
      userId,
      namespace,
      allowMultipleReactions,
    });
  }

  /**
   * Remove a reaction for a user on a target.
   * This is idempotent - if the reaction doesn't exist, it does nothing.
   */
  async remove(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    label: string,
    userId: string,
    namespace?: string,
  ) {
    return ctx.runMutation(this.component.lib.remove, {
      targetId,
      label,
      userId,
      namespace,
    });
  }

  /**
   * Get reaction counts for a target, grouped by reaction type.
   */
  async getCounts(
    ctx: CtxWith<"runQuery">,
    targetId: string,
    namespace?: string,
  ) {
    return ctx.runQuery(this.component.lib.getCounts, { targetId, namespace });
  }

  /**
   * Get reaction counts for multiple targets in a single query.
   * This is more efficient than calling getCounts multiple times as it reduces
   * overhead from crossing the component isolation boundary.
   */
  async getBatchCounts(
    ctx: CtxWith<"runQuery">,
    targets: Array<{ targetId: string; namespace?: string }>,
  ) {
    return ctx.runQuery(this.component.lib.getBatchCounts, { targets });
  }

  /**
   * Get all individual reactions for a target.
   */
  async list(ctx: CtxWith<"runQuery">, targetId: string, namespace?: string) {
    return ctx.runQuery(this.component.lib.list, { targetId, namespace });
  }

  /**
   * Get all reaction types that a user has used on a target.
   */
  async getUserReactions(
    ctx: CtxWith<"runQuery">,
    targetId: string,
    userId: string,
    namespace?: string,
  ) {
    return ctx.runQuery(this.component.lib.getUserReactions, {
      targetId,
      userId,
      namespace,
    });
  }

  /**
   * Check if a user has reacted with a specific reaction type on a target.
   */
  async hasUserReacted(
    ctx: CtxWith<"runQuery">,
    targetId: string,
    label: string,
    userId: string,
    namespace?: string,
  ) {
    return ctx.runQuery(this.component.lib.hasUserReacted, {
      targetId,
      label,
      userId,
      namespace,
    });
  }

  /**
   * Delete all reactions for a target (optionally filtered by namespace).
   * This is useful for cascading deletes when removing content that has reactions.
   */
  async deleteAllForTarget(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    namespace?: string,
  ) {
    return ctx.runMutation(this.component.lib.deleteAllForTarget, {
      targetId,
      namespace,
    });
  }

  /**
   * Register routes for the component.
   * This is a convenience method to register routes for the component.
   * @param http - The http router to register the routes on.
   * @param options - The options for the routes.
   * @returns The http router with the routes registered.
   */

  // example of how to register routes for the component
  registerRoutes(
    http: HttpRouter,
    {
      path,
    }: {
      path: string;
    },
  ) {
    http.route({
      path,
      method: "GET",
      handler: httpActionGeneric(async (ctx, req) => {
        const url = new URL(req.url);
        const targetId = url.searchParams.get("targetId");
        if (!targetId) {
          return new Response(
            JSON.stringify({ error: "Missing targetId parameter" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        const namespace = url.searchParams.get("namespace");
        const counts = await this.getCounts(
          ctx,
          targetId,
          namespace || undefined,
        );
        return new Response(JSON.stringify(counts), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    });
  }
}

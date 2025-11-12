import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component.js";
import type { CtxWith } from "./types.js";

// UseApi<typeof api> is an alternative that has jump-to-definition but is
// less stable and reliant on types within the component files, which can cause
// issues where passing `components.foo` doesn't match the argument

export class Reactions {
  constructor(
    public component: ComponentApi,
    public options?: {
      // Common parameters:
      // logLevel
    },
  ) {}

  /**
   * Toggle a reaction for a user on a target.
   * If the reaction exists, it will be removed. If it doesn't, it will be added.
   */
  async toggle(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    reactionType: string,
    userId: string,
  ) {
    return ctx.runMutation(this.component.lib.toggle, {
      targetId,
      reactionType,
      userId,
    });
  }

  /**
   * Add a reaction for a user on a target.
   * This is idempotent - if the reaction already exists, it does nothing.
   */
  async add(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    reactionType: string,
    userId: string,
  ) {
    return ctx.runMutation(this.component.lib.add, {
      targetId,
      reactionType,
      userId,
    });
  }

  /**
   * Remove a reaction for a user on a target.
   * This is idempotent - if the reaction doesn't exist, it does nothing.
   */
  async remove(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    reactionType: string,
    userId: string,
  ) {
    return ctx.runMutation(this.component.lib.remove, {
      targetId,
      reactionType,
      userId,
    });
  }

  /**
   * Get reaction counts for a target, grouped by reaction type.
   */
  async getCounts(ctx: CtxWith<"runQuery">, targetId: string) {
    return ctx.runQuery(this.component.lib.getCounts, { targetId });
  }

  /**
   * Get all individual reactions for a target.
   */
  async list(ctx: CtxWith<"runQuery">, targetId: string) {
    return ctx.runQuery(this.component.lib.list, { targetId });
  }

  /**
   * Get all reaction types that a user has used on a target.
   */
  async getUserReactions(
    ctx: CtxWith<"runQuery">,
    targetId: string,
    userId: string,
  ) {
    return ctx.runQuery(this.component.lib.getUserReactions, {
      targetId,
      userId,
    });
  }

  /**
   * Check if a user has reacted with a specific reaction type on a target.
   */
  async hasUserReacted(
    ctx: CtxWith<"runQuery">,
    targetId: string,
    reactionType: string,
    userId: string,
  ) {
    return ctx.runQuery(this.component.lib.hasUserReacted, {
      targetId,
      reactionType,
      userId,
    });
  }

  /**
   * For easy re-exporting.
   * Apps can do:
   * ```ts
   * export const { toggle, getCounts, list } = reactions.api();
   * ```
   */
  api() {
    return {
      toggle: mutationGeneric({
        args: {
          targetId: v.string(),
          reactionType: v.string(),
          userId: v.string(),
        },
        returns: v.object({
          added: v.boolean(),
        }),
        handler: async (ctx, args) => {
          return await this.toggle(
            ctx,
            args.targetId,
            args.reactionType,
            args.userId,
          );
        },
      }),
      add: mutationGeneric({
        args: {
          targetId: v.string(),
          reactionType: v.string(),
          userId: v.string(),
        },
        returns: v.object({
          added: v.boolean(),
        }),
        handler: async (ctx, args) => {
          return await this.add(
            ctx,
            args.targetId,
            args.reactionType,
            args.userId,
          );
        },
      }),
      remove: mutationGeneric({
        args: {
          targetId: v.string(),
          reactionType: v.string(),
          userId: v.string(),
        },
        returns: v.object({
          removed: v.boolean(),
        }),
        handler: async (ctx, args) => {
          return await this.remove(
            ctx,
            args.targetId,
            args.reactionType,
            args.userId,
          );
        },
      }),
      getCounts: queryGeneric({
        args: { targetId: v.string() },
        returns: v.array(
          v.object({
            reactionType: v.string(),
            count: v.number(),
          }),
        ),
        handler: async (ctx, args) => {
          return await this.getCounts(ctx, args.targetId);
        },
      }),
      list: queryGeneric({
        args: { targetId: v.string() },
        returns: v.array(
          v.object({
            _id: v.id("reactions"),
            _creationTime: v.number(),
            targetId: v.string(),
            reactionType: v.string(),
            userId: v.string(),
          }),
        ),
        handler: async (ctx, args) => {
          return await this.list(ctx, args.targetId);
        },
      }),
      getUserReactions: queryGeneric({
        args: { targetId: v.string(), userId: v.string() },
        returns: v.array(v.string()),
        handler: async (ctx, args) => {
          return await this.getUserReactions(ctx, args.targetId, args.userId);
        },
      }),
      hasUserReacted: queryGeneric({
        args: {
          targetId: v.string(),
          reactionType: v.string(),
          userId: v.string(),
        },
        returns: v.boolean(),
        handler: async (ctx, args) => {
          return await this.hasUserReacted(
            ctx,
            args.targetId,
            args.reactionType,
            args.userId,
          );
        },
      }),
    };
  }
}

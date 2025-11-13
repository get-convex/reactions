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
   * This is idempotent - if the reaction already exists, it does nothing.
   */
  async add(
    ctx: CtxWith<"runMutation">,
    targetId: string,
    reactionType: string,
    userId: string,
    namespace?: string,
  ) {
    return ctx.runMutation(this.component.lib.add, {
      targetId,
      reactionType,
      userId,
      namespace,
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
    namespace?: string,
  ) {
    return ctx.runMutation(this.component.lib.remove, {
      targetId,
      reactionType,
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
    reactionType: string,
    userId: string,
    namespace?: string,
  ) {
    return ctx.runQuery(this.component.lib.hasUserReacted, {
      targetId,
      reactionType,
      userId,
      namespace,
    });
  }
}

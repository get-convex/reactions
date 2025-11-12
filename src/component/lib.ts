import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

/**
 * Add a reaction for a user on a target.
 * Any existing reactions by this user on this target+namespace will be removed first.
 * If the exact reaction already exists, this is a no-op.
 */
export const add = mutation({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.object({
    added: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if this exact reaction already exists
    const existingReactions = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_namespace_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined)
          .eq("userId", args.userId),
      )
      .collect();

    if (existingReactions.length > 0) {
      // check for the reaction type in the existing reactions
      if (existingReactions.some((r) => r.reactionType === args.reactionType)) {
        return { added: false };
      }
    }

    // Remove any other reactions by this user on this target+namespace
    await removeAllUserReactionsOnTarget(
      ctx,
      args.targetId,
      args.userId,
      args.namespace,
    );

    // Add the new reaction
    await ctx.db.insert("reactions", {
      targetId: args.targetId,
      reactionType: args.reactionType,
      userId: args.userId,
      namespace: args.namespace,
    });
    await incrementCount(ctx, args.targetId, args.reactionType, args.namespace);
    return { added: true };
  },
});

/**
 * Remove a reaction for a user on a target.
 * This is idempotent - if the reaction doesn't exist, it does nothing.
 */
export const remove = mutation({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.object({
    removed: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if this specific reaction exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_namespace_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined)
          .eq("reactionType", args.reactionType)
          .eq("userId", args.userId),
      )
      .unique();

    if (!existing) {
      return { removed: false };
    }

    // Remove this specific reaction
    await ctx.db.delete(existing._id);
    await decrementCount(ctx, args.targetId, args.reactionType, args.namespace);
    return { removed: true };
  },
});

/**
 * Get all reactions for a target, grouped by reaction type with counts.
 */
export const getCounts = query({
  args: {
    targetId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      reactionType: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const counts = await ctx.db
      .query("reactionCounts")
      .withIndex("by_targetId_and_namespace_and_reactionType", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined),
      )
      .collect();

    return counts
      .filter((c) => c.count > 0)
      .map((c) => ({
        reactionType: c.reactionType,
        count: c.count,
      }));
  },
});

/**
 * Get all reactions for a target (individual reactions, not aggregated).
 */
export const list = query({
  args: {
    targetId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("reactions"),
      _creationTime: v.number(),
      targetId: v.string(),
      reactionType: v.string(),
      userId: v.string(),
      namespace: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_namespace_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined),
      )
      .collect();

    return reactions;
  },
});

/**
 * Get all reactions by a specific user on a target.
 */
export const getUserReactions = query({
  args: {
    targetId: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_namespace_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined)
          .eq("userId", args.userId),
      )
      .collect();

    return reactions.map((r) => r.reactionType);
  },
});

/**
 * Check if a user has reacted with a specific reaction type on a target.
 */
export const hasUserReacted = query({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_namespace_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("namespace", args.namespace ?? undefined)
          .eq("reactionType", args.reactionType)
          .eq("userId", args.userId),
      )
      .unique();

    return existing !== null;
  },
});

// Helper functions

async function incrementCount(
  ctx: { db: any },
  targetId: string,
  reactionType: string,
  namespace?: string,
) {
  const existing = await ctx.db
    .query("reactionCounts")
    .withIndex("by_targetId_and_namespace_and_reactionType", (q: any) =>
      q
        .eq("targetId", targetId)
        .eq("namespace", namespace ?? undefined)
        .eq("reactionType", reactionType),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
    });
  } else {
    await ctx.db.insert("reactionCounts", {
      targetId,
      reactionType,
      count: 1,
      namespace,
    });
  }
}

async function decrementCount(
  ctx: { db: any },
  targetId: string,
  reactionType: string,
  namespace?: string,
) {
  const existing = await ctx.db
    .query("reactionCounts")
    .withIndex("by_targetId_and_namespace_and_reactionType", (q: any) =>
      q
        .eq("targetId", targetId)
        .eq("namespace", namespace ?? undefined)
        .eq("reactionType", reactionType),
    )
    .unique();

  if (existing) {
    const newCount = Math.max(0, existing.count - 1);
    await ctx.db.patch(existing._id, {
      count: newCount,
    });
  }
}

async function removeAllUserReactionsOnTarget(
  ctx: { db: any },
  targetId: string,
  userId: string,
  namespace?: string,
) {
  const existingReactions = await ctx.db
    .query("reactions")
    .withIndex("by_targetId_and_namespace_and_userId", (q: any) =>
      q
        .eq("targetId", targetId)
        .eq("namespace", namespace ?? undefined)
        .eq("userId", userId),
    )
    .collect();

  for (const reaction of existingReactions) {
    await ctx.db.delete(reaction._id);
    await decrementCount(ctx, targetId, reaction.reactionType, namespace);
  }
}

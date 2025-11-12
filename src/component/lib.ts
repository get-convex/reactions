import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

/**
 * Toggle a reaction for a user on a target.
 * If the reaction exists, it will be removed (and count decremented).
 * If it doesn't exist, it will be added (and count incremented).
 */
export const toggle = mutation({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
  },
  returns: v.object({
    added: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if reaction already exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("reactionType", args.reactionType)
          .eq("userId", args.userId),
      )
      .unique();

    if (existing) {
      // Remove reaction
      await ctx.db.delete(existing._id);
      await decrementCount(ctx, args.targetId, args.reactionType);
      return { added: false };
    } else {
      // Add reaction
      await ctx.db.insert("reactions", {
        targetId: args.targetId,
        reactionType: args.reactionType,
        userId: args.userId,
      });
      await incrementCount(ctx, args.targetId, args.reactionType);
      return { added: true };
    }
  },
});

/**
 * Add a reaction for a user on a target.
 * This is idempotent - if the reaction already exists, it does nothing.
 */
export const add = mutation({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
  },
  returns: v.object({
    added: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if reaction already exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("reactionType", args.reactionType)
          .eq("userId", args.userId),
      )
      .unique();

    if (existing) {
      return { added: false };
    }

    // Add reaction
    await ctx.db.insert("reactions", {
      targetId: args.targetId,
      reactionType: args.reactionType,
      userId: args.userId,
    });
    await incrementCount(ctx, args.targetId, args.reactionType);
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
  },
  returns: v.object({
    removed: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // Check if reaction exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
          .eq("reactionType", args.reactionType)
          .eq("userId", args.userId),
      )
      .unique();

    if (!existing) {
      return { removed: false };
    }

    // Remove reaction
    await ctx.db.delete(existing._id);
    await decrementCount(ctx, args.targetId, args.reactionType);
    return { removed: true };
  },
});

/**
 * Get all reactions for a target, grouped by reaction type with counts.
 */
export const getCounts = query({
  args: {
    targetId: v.string(),
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
      .withIndex("by_targetId", (q) => q.eq("targetId", args.targetId))
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
  },
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
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_targetId", (q) => q.eq("targetId", args.targetId))
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
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_userId", (q) =>
        q.eq("targetId", args.targetId).eq("userId", args.userId),
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
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_targetId_and_reactionType_and_userId", (q) =>
        q
          .eq("targetId", args.targetId)
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
) {
  const existing = await ctx.db
    .query("reactionCounts")
    .withIndex("by_targetId_and_reactionType", (q: any) =>
      q.eq("targetId", targetId).eq("reactionType", reactionType),
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
    });
  }
}

async function decrementCount(
  ctx: { db: any },
  targetId: string,
  reactionType: string,
) {
  const existing = await ctx.db
    .query("reactionCounts")
    .withIndex("by_targetId_and_reactionType", (q: any) =>
      q.eq("targetId", targetId).eq("reactionType", reactionType),
    )
    .unique();

  if (existing) {
    const newCount = Math.max(0, existing.count - 1);
    await ctx.db.patch(existing._id, {
      count: newCount,
    });
  }
}

import { mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { Reactions } from "@convex/reactions";
import { v } from "convex/values";

const reactions = new Reactions(components.reactions, {});

/**
 * Example: Add a reaction to a post
 * If the user has already reacted with a different emoji, it will be replaced.
 * If the user already has this exact reaction, this is a no-op.
 */
export const addReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await reactions.add(ctx, args.postId, args.emoji, args.userId);
    return null;
  },
});

/**
 * Example: Remove a reaction from a post
 */
export const removeReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await reactions.remove(ctx, args.postId, args.emoji, args.userId);
    return null;
  },
});

/**
 * Example: Get all reaction counts for a post
 * Returns an array like: [{ reactionType: "👍", count: 5 }, { reactionType: "❤️", count: 3 }]
 */
export const getPostReactions = query({
  args: {
    postId: v.string(),
  },
  returns: v.array(
    v.object({
      reactionType: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await reactions.getCounts(ctx, args.postId);
  },
});

/**
 * Example: Check which reactions a specific user has made on a post
 */
export const getUserPostReactions = query({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    return await reactions.getUserReactions(ctx, args.postId, args.userId);
  },
});

/**
 * Example: Check if a user has reacted with a specific emoji
 */
export const hasUserLikedPost = query({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return await reactions.hasUserReacted(ctx, args.postId, "👍", args.userId);
  },
});

// Direct re-export of component's API.
// This allows clients to call these functions directly.
export const {
  add,
  remove,
  getCounts,
  list,
  getUserReactions,
  hasUserReacted,
} = reactions.api();

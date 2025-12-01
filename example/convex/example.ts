/**
 * Example usage of the Reactions component.
 *
 * This file demonstrates the core reactions functionality including:
 * - Adding and removing reactions with validation
 * - Querying reaction counts and user reactions
 * - Checking if users have reacted
 *
 * See posts.ts for post management and cascade delete examples.
 * See http.ts for an example of exposing reactions via HTTP endpoints.
 */
import { mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { Reactions } from "@convex/reactions";
import { v } from "convex/values";

export const reactions = new Reactions(components.reactions, {});

// Define the set of allowed emoji reactions
const ALLOWED_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🙏",
  "👀",
  "🚀",
  "🎉",
] as const;

/**
 * Example: Add a reaction to a post
 * If the user has already reacted with a different emoji, it will be replaced.
 * If the user already has this exact reaction, this is a no-op.
 *
 * This demonstrates client-side validation to ensure only allowed emojis are accepted.
 */
export const addReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate that the emoji is one of the allowed ones
    if (!ALLOWED_EMOJIS.includes(args.emoji as any)) {
      throw new Error(
        `Invalid emoji: "${args.emoji}". Allowed emojis are: ${ALLOWED_EMOJIS.join(", ")}`,
      );
    }

    await reactions.add(ctx, args.postId, args.emoji, args.userId);
  },
});

/**
 * Example: Add a reaction to a post allowing multiple reactions per user
 * Unlike addReaction, this allows a user to have multiple different reactions on the same post.
 * If the user already has this exact reaction, this is a no-op.
 *
 * This is useful for scenarios where you want users to be able to express
 * multiple emotions or reactions on the same content.
 */
export const addMultipleReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Validate that the emoji is one of the allowed ones
    if (!ALLOWED_EMOJIS.includes(args.emoji as any)) {
      throw new Error(
        `Invalid emoji: "${args.emoji}". Allowed emojis are: ${ALLOWED_EMOJIS.join(", ")}`,
      );
    }

    await reactions.add(
      ctx,
      args.postId,
      args.emoji,
      args.userId,
      undefined, // namespace
      true, // allowMultipleReactions
    );
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
    // Validate that the emoji is one of the allowed ones
    if (!ALLOWED_EMOJIS.includes(args.emoji as any)) {
      throw new Error(
        `Invalid emoji: "${args.emoji}". Allowed emojis are: ${ALLOWED_EMOJIS.join(", ")}`,
      );
    }

    await reactions.remove(ctx, args.postId, args.emoji, args.userId);
  },
});

/**
 * Example: Get the list of allowed emojis
 * Clients can use this to display available reactions to users
 */
export const getAllowedEmojis = query({
  args: {},
  returns: v.array(v.string()),
  handler: async () => {
    return [...ALLOWED_EMOJIS];
  },
});

/**
 * Example: Get all reaction counts for a post
 * Returns an array like: [{ label: "👍", count: 5 }, { label: "❤️", count: 3 }]
 */
export const getPostReactions = query({
  args: {
    postId: v.string(),
  },
  returns: v.array(
    v.object({
      label: v.string(),
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

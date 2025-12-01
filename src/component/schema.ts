import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Individual reactions - one document per user reaction
  reactions: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  }).index("targetId_namespace_userId_reactionType", [
    "targetId",
    "namespace", // "likes", 
    "userId",
    "reactionType", // "♥️", "👍", "👎", etc.
  ]),

  // Denormalized counts for fast aggregation
  reactionCounts: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    count: v.number(),
    namespace: v.optional(v.string()),
  }).index("targetId_namespace_reactionType", [
    "targetId",
    "namespace",
    "reactionType",
  ]),
});

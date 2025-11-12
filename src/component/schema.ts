import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Individual reactions - one document per user reaction
  reactions: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  }).index("by_targetId_and_namespace_and_userId", [
    "targetId",
    "namespace",
    "userId",
  ]),
  // Denormalized counts for fast aggregation
  reactionCounts: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    count: v.number(),
    namespace: v.optional(v.string()),
  }).index("by_targetId_and_namespace_and_reactionType", [
    "targetId",
    "namespace",
    "reactionType",
  ]),
});

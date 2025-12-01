import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Individual reactions - one document per user reaction
  reactions: defineTable({
    targetId: v.string(),
    label: v.string(),
    userId: v.string(),
    namespace: v.optional(v.string()),
  }).index("targetId_namespace_userId_label", [
    "targetId",
    "namespace", // "likes",
    "userId",
    "label", // "♥️", "👍", "👎", etc.
  ]),

  // Denormalized counts for fast aggregation
  reactionCounts: defineTable({
    targetId: v.string(),
    label: v.string(),
    count: v.number(),
    namespace: v.optional(v.string()),
  }).index("targetId_namespace_label", ["targetId", "namespace", "label"]),
});

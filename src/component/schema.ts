import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Individual reactions - one document per user reaction
  reactions: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
  })
    .index("by_targetId", ["targetId"])
    .index("by_targetId_and_reactionType", ["targetId", "reactionType"])
    .index("by_targetId_and_userId", ["targetId", "userId"])
    .index("by_targetId_and_reactionType_and_userId", [
      "targetId",
      "reactionType",
      "userId",
    ]),

  // Denormalized counts for fast aggregation
  reactionCounts: defineTable({
    targetId: v.string(),
    reactionType: v.string(),
    count: v.number(),
  })
    .index("by_targetId", ["targetId"])
    .index("by_targetId_and_reactionType", ["targetId", "reactionType"]),
});

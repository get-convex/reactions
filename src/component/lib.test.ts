/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import { api } from "./_generated/api.js";
import { modules } from "./setup.test.js";

describe("component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("add reaction", async () => {
    const t = convexTest(schema, modules);
    const result = await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(result).toBeNull();

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 1 }]);
  });

  test("add reaction is idempotent", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    const result = await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(result).toBeNull();

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 1 }]);
  });

  test("multiple users multiple reactions", async () => {
    const t = convexTest(schema, modules);

    // User 1 adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    // User 2 adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user2",
    });

    // User 2 adds heart (replaces their thumbs up)
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user2",
    });

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    // User1 has 👍, User2 has ❤️ (replaced their 👍)
    expect(counts).toHaveLength(2);
    expect(counts).toEqual(
      expect.arrayContaining([
        { label: "👍", count: 1 },
        { label: "❤️", count: 1 },
      ]),
    );
  });

  test("getUserReactions", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    // Adding heart replaces the thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });

    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    // User can only have one reaction per target+namespace
    expect(userReactions).toEqual(["❤️"]);
    expect(userReactions).toHaveLength(1);
  });

  test("hasUserReacted", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user1",
      }),
    ).toBe(true);

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "❤️",
        userId: "user1",
      }),
    ).toBe(false);

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user2",
      }),
    ).toBe(false);
  });

  test("remove reaction", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    const result = await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(result).toBeNull();

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([]);
  });

  test("remove is idempotent", async () => {
    const t = convexTest(schema, modules);

    const result = await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(result).toBeNull();
  });

  test("list all reactions", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user2",
    });

    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(2);
    expect(reactions.every((r) => r.targetId === "post1")).toBe(true);
  });

  test("changing reaction replaces previous reaction", async () => {
    const t = convexTest(schema, modules);

    // User adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    let counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 1 }]);

    // User changes to heart (replaces thumbs up)
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });

    counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "❤️", count: 1 }]);

    // User changes to fire (replaces heart)
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "🔥",
      userId: "user1",
    });

    counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "🔥", count: 1 }]);

    // User should only have one reaction
    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    expect(userReactions).toEqual(["🔥"]);
  });

  test("users can have different reactions in different namespaces", async () => {
    const t = convexTest(schema, modules);

    // User reacts in "sentiment" namespace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
      namespace: "sentiment",
    });

    // User reacts in "quality" namespace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "⭐",
      userId: "user1",
      namespace: "quality",
    });

    // Both reactions should exist in their respective namespaces
    const sentimentCounts = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: "sentiment",
    });
    expect(sentimentCounts).toEqual([{ label: "👍", count: 1 }]);

    const qualityCounts = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: "quality",
    });
    expect(qualityCounts).toEqual([{ label: "⭐", count: 1 }]);
  });

  test("reactions on different targets are isolated", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    await t.mutation(api.lib.add, {
      targetId: "post2",
      label: "👍",
      userId: "user1",
    });

    const post1Counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    const post2Counts = await t.query(api.lib.getCounts, { targetId: "post2" });

    expect(post1Counts).toEqual([{ label: "👍", count: 1 }]);
    expect(post2Counts).toEqual([{ label: "👍", count: 1 }]);
  });

  test("remove doesn't affect other users' reactions", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user2",
    });

    // Remove user1's reaction
    await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 1 }]);

    // User2 should still have their reaction
    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user2",
      }),
    ).toBe(true);
  });

  test("counts are accurate after multiple operations", async () => {
    const t = convexTest(schema, modules);

    // Add reactions from multiple users
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user2",
    });
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user3",
    });

    let counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 3 }]);

    // User1 changes to heart
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });

    counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toHaveLength(2);
    expect(counts).toEqual(
      expect.arrayContaining([
        { label: "👍", count: 2 },
        { label: "❤️", count: 1 },
      ]),
    );

    // User2 removes their reaction
    await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user2",
    });

    counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toHaveLength(2);
    expect(counts).toEqual(
      expect.arrayContaining([
        { label: "👍", count: 1 },
        { label: "❤️", count: 1 },
      ]),
    );
  });

  test("list filters by namespace correctly", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
      namespace: "sentiment",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "⭐",
      userId: "user1",
      namespace: "quality",
    });

    const sentimentReactions = await t.query(api.lib.list, {
      targetId: "post1",
      namespace: "sentiment",
    });

    const qualityReactions = await t.query(api.lib.list, {
      targetId: "post1",
      namespace: "quality",
    });

    expect(sentimentReactions).toHaveLength(1);
    expect(sentimentReactions[0].label).toBe("👍");
    expect(sentimentReactions[0].namespace).toBe("sentiment");

    expect(qualityReactions).toHaveLength(1);
    expect(qualityReactions[0].label).toBe("⭐");
    expect(qualityReactions[0].namespace).toBe("quality");
  });

  test("getUserReactions filters by namespace", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
      namespace: "sentiment",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "⭐",
      userId: "user1",
      namespace: "quality",
    });

    const sentimentReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
      namespace: "sentiment",
    });

    const qualityReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
      namespace: "quality",
    });

    expect(sentimentReactions).toEqual(["👍"]);
    expect(qualityReactions).toEqual(["⭐"]);
  });

  test("hasUserReacted returns false after removal", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user1",
      }),
    ).toBe(true);

    await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user1",
      }),
    ).toBe(false);
  });

  test("queries on non-existent target return empty results", async () => {
    const t = convexTest(schema, modules);

    const counts = await t.query(api.lib.getCounts, {
      targetId: "nonexistent",
    });
    expect(counts).toEqual([]);

    const reactions = await t.query(api.lib.list, {
      targetId: "nonexistent",
    });
    expect(reactions).toEqual([]);

    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "nonexistent",
      userId: "user1",
    });
    expect(userReactions).toEqual([]);

    const hasReacted = await t.query(api.lib.hasUserReacted, {
      targetId: "nonexistent",
      label: "👍",
      userId: "user1",
    });
    expect(hasReacted).toBe(false);
  });

  test("counts don't show reactions with zero count", async () => {
    const t = convexTest(schema, modules);

    // Add and remove a reaction
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    // Should not include 👍 with count 0
    expect(counts).toEqual([]);
  });

  test("changing reaction in one namespace doesn't affect other namespace", async () => {
    const t = convexTest(schema, modules);

    // Add reactions in both namespaces
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
      namespace: "sentiment",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "⭐",
      userId: "user1",
      namespace: "quality",
    });

    // Change reaction in sentiment namespace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
      namespace: "sentiment",
    });

    // Quality namespace should be unaffected
    const qualityCounts = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: "quality",
    });
    expect(qualityCounts).toEqual([{ label: "⭐", count: 1 }]);

    // Sentiment namespace should have the new reaction
    const sentimentCounts = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: "sentiment",
    });
    expect(sentimentCounts).toEqual([{ label: "❤️", count: 1 }]);
  });

  test("multiple users can have same reaction type", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user2",
    });

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user3",
    });

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "👍", count: 3 }]);

    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(3);
    expect(reactions.every((r) => r.label === "👍")).toBe(true);
  });

  test("list returns reactions with creation time", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    const reactions = await t.query(api.lib.list, { targetId: "post1" });

    expect(reactions).toHaveLength(1);
    expect(reactions[0]).toHaveProperty("_id");
    expect(reactions[0]).toHaveProperty("_creationTime");
    expect(typeof reactions[0]._creationTime).toBe("number");
  });

  test("remove removes only the specific reaction type", async () => {
    const t = convexTest(schema, modules);

    // This shouldn't happen in practice since users can only have one reaction,
    // but let's test the remove function behavior
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    // Try to remove a different reaction type
    const result = await t.mutation(api.lib.remove, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });

    expect(result).toBeNull();

    // Original reaction should still be there
    const hasReacted = await t.query(api.lib.hasUserReacted, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(hasReacted).toBe(true);
  });

  test("namespace undefined is treated as default namespace", async () => {
    const t = convexTest(schema, modules);

    // Add without namespace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    // Query with undefined namespace
    const countsWithUndefined = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: undefined,
    });

    // Query without namespace parameter
    const countsWithout = await t.query(api.lib.getCounts, {
      targetId: "post1",
    });

    expect(countsWithUndefined).toEqual([{ label: "👍", count: 1 }]);
    expect(countsWithout).toEqual([{ label: "👍", count: 1 }]);
  });

  test("posting two reactions to same target+namespace only records the second", async () => {
    const t = convexTest(schema, modules);

    // User adds first reaction
    const result1 = await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });
    expect(result1).toBeNull();

    // User adds second reaction - should replace the first
    const result2 = await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });
    expect(result2).toBeNull();

    // Only the second reaction should exist
    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(1);
    expect(reactions[0].label).toBe("❤️");
    expect(reactions[0].userId).toBe("user1");

    // Counts should only show the second reaction
    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ label: "❤️", count: 1 }]);

    // User should only have the second reaction
    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    expect(userReactions).toEqual(["❤️"]);

    // First reaction should not exist
    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user1",
      }),
    ).toBe(false);

    // Second reaction should exist
    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "❤️",
        userId: "user1",
      }),
    ).toBe(true);
  });

  test("posting two reactions to same target+namespace with explicit namespace", async () => {
    const t = convexTest(schema, modules);

    // User adds first reaction in "sentiment" namespace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
      namespace: "sentiment",
    });

    // Verify first reaction exists
    let reactions = await t.query(api.lib.list, {
      targetId: "post1",
      namespace: "sentiment",
    });
    expect(reactions).toHaveLength(1);
    expect(reactions[0].label).toBe("👍");

    // User adds second reaction in same namespace - should replace
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
      namespace: "sentiment",
    });

    // Only the second reaction should exist in this namespace
    reactions = await t.query(api.lib.list, {
      targetId: "post1",
      namespace: "sentiment",
    });
    expect(reactions).toHaveLength(1);
    expect(reactions[0].label).toBe("❤️");
    expect(reactions[0].namespace).toBe("sentiment");

    // Counts should only show the second reaction
    const counts = await t.query(api.lib.getCounts, {
      targetId: "post1",
      namespace: "sentiment",
    });
    expect(counts).toEqual([{ label: "❤️", count: 1 }]);
  });

  test("posting three reactions in sequence only keeps the last one", async () => {
    const t = convexTest(schema, modules);

    // Add first reaction
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    // Add second reaction
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user1",
    });

    // Add third reaction
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "🎉",
      userId: "user1",
    });

    // Only the last reaction should exist
    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(1);
    expect(reactions[0].label).toBe("🎉");

    // User should only have the last reaction
    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    expect(userReactions).toEqual(["🎉"]);

    // Previous reactions should not exist
    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "👍",
        userId: "user1",
      }),
    ).toBe(false);

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        label: "❤️",
        userId: "user1",
      }),
    ).toBe(false);
  });

  test("multiple users posting reactions to same target are independent", async () => {
    const t = convexTest(schema, modules);

    // User1 adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "👍",
      userId: "user1",
    });

    // User2 adds heart
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "❤️",
      userId: "user2",
    });

    // User1 changes to fire (should not affect user2)
    await t.mutation(api.lib.add, {
      targetId: "post1",
      label: "🔥",
      userId: "user1",
    });

    // Should have both reactions, one per user
    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(2);

    // User1 should only have fire
    const user1Reactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    expect(user1Reactions).toEqual(["🔥"]);

    // User2 should still have heart (unchanged)
    const user2Reactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user2",
    });
    expect(user2Reactions).toEqual(["❤️"]);

    // Counts should reflect both current reactions
    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toHaveLength(2);
    expect(counts).toEqual(
      expect.arrayContaining([
        { label: "🔥", count: 1 },
        { label: "❤️", count: 1 },
      ]),
    );
  });
});

import { afterEach, beforeEach, describe, test, vi, expect } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("addReaction", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.addReaction, {
      postId: "post1",
      emoji: "👍",
      userId: "user1",
    });
  });

  test("getPostReactions", async () => {
    const t = initConvexTest();
    // Add some reactions first
    await t.mutation(api.example.addReaction, {
      postId: "post2",
      emoji: "❤️",
      userId: "user2",
    });

    const counts = await t.query(api.example.getPostReactions, {
      postId: "post2",
    });

    expect(counts).toEqual([{ label: "❤️", count: 1 }]);
  });

  test("getUserPostReactions", async () => {
    const t = initConvexTest();

    await t.mutation(api.example.addReaction, {
      postId: "post3",
      emoji: "👍",
      userId: "user1",
    });

    const userReactions = await t.query(api.example.getUserPostReactions, {
      postId: "post3",
      userId: "user1",
    });

    expect(userReactions).toEqual(["👍"]);
  });

  test("hasUserLikedPost", async () => {
    const t = initConvexTest();

    await t.mutation(api.example.addReaction, {
      postId: "post4",
      emoji: "👍",
      userId: "user1",
    });

    const hasLiked = await t.query(api.example.hasUserLikedPost, {
      postId: "post4",
      userId: "user1",
    });

    expect(hasLiked).toBe(true);
  });

  test("getBatchPostReactions", async () => {
    const t = initConvexTest();

    // Add reactions to multiple posts
    await t.mutation(api.example.addReaction, {
      postId: "post5",
      emoji: "👍",
      userId: "user1",
    });
    await t.mutation(api.example.addReaction, {
      postId: "post5",
      emoji: "❤️",
      userId: "user2",
    });
    await t.mutation(api.example.addReaction, {
      postId: "post6",
      emoji: "🚀",
      userId: "user1",
    });

    // Query batch reactions
    const batchResults = await t.query(api.example.getBatchPostReactions, {
      postIds: ["post5", "post6", "post7"],
    });

    expect(batchResults).toHaveLength(3);
    
    // Check post5 reactions
    const post5Result = batchResults.find((r) => r.targetId === "post5");
    expect(post5Result?.counts).toEqual(
      expect.arrayContaining([
        { label: "👍", count: 1 },
        { label: "❤️", count: 1 },
      ]),
    );

    // Check post6 reactions
    const post6Result = batchResults.find((r) => r.targetId === "post6");
    expect(post6Result?.counts).toEqual([{ label: "🚀", count: 1 }]);

    // Check post7 (no reactions)
    const post7Result = batchResults.find((r) => r.targetId === "post7");
    expect(post7Result?.counts).toEqual([]);
  });
});

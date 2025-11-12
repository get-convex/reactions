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

  test("toggleReaction", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.toggleReaction, {
      postId: "post1",
      emoji: "👍",
      userId: "user1",
    });
  });

  test("getPostReactions", async () => {
    const t = initConvexTest();
    // Add some reactions first
    await t.mutation(api.example.addReactionToComment, {
      commentId: "comment1",
      emoji: "❤️",
      userId: "user1",
    });

    // Query counts using the toggle function (which also adds)
    await t.mutation(api.example.toggle, {
      targetId: "post2",
      reactionType: "🎉",
      userId: "user2",
    });

    const counts = await t.query(api.example.getPostReactions, {
      postId: "post2",
    });

    expect(counts).toEqual([{ reactionType: "🎉", count: 1 }]);
  });

  test("getUserPostReactions", async () => {
    const t = initConvexTest();

    await t.mutation(api.example.add, {
      targetId: "post3",
      reactionType: "👍",
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

    await t.mutation(api.example.add, {
      targetId: "post4",
      reactionType: "👍",
      userId: "user1",
    });

    const hasLiked = await t.query(api.example.hasUserLikedPost, {
      postId: "post4",
      userId: "user1",
    });

    expect(hasLiked).toBe(true);
  });
});

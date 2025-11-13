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

    expect(counts).toEqual([{ reactionType: "❤️", count: 1 }]);
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
});

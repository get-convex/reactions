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
      reactionType: "👍",
      userId: "user1",
    });
    expect(result.added).toBe(true);

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ reactionType: "👍", count: 1 }]);
  });

  test("add reaction is idempotent", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    const result = await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    expect(result.added).toBe(false);

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ reactionType: "👍", count: 1 }]);
  });

  test("toggle reaction on and off", async () => {
    const t = convexTest(schema, modules);

    // Toggle on
    const result1 = await t.mutation(api.lib.toggle, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user1",
    });
    expect(result1.added).toBe(true);

    let counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([{ reactionType: "❤️", count: 1 }]);

    // Toggle off
    const result2 = await t.mutation(api.lib.toggle, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user1",
    });
    expect(result2.added).toBe(false);

    counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([]);
  });

  test("multiple users multiple reactions", async () => {
    const t = convexTest(schema, modules);

    // User 1 adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });

    // User 2 adds thumbs up
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user2",
    });

    // User 2 adds heart
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user2",
    });

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([
      { reactionType: "👍", count: 2 },
      { reactionType: "❤️", count: 1 },
    ]);
  });

  test("getUserReactions", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user1",
    });

    const userReactions = await t.query(api.lib.getUserReactions, {
      targetId: "post1",
      userId: "user1",
    });
    expect(userReactions).toEqual(expect.arrayContaining(["👍", "❤️"]));
    expect(userReactions).toHaveLength(2);
  });

  test("hasUserReacted", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        reactionType: "👍",
        userId: "user1",
      }),
    ).toBe(true);

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        reactionType: "❤️",
        userId: "user1",
      }),
    ).toBe(false);

    expect(
      await t.query(api.lib.hasUserReacted, {
        targetId: "post1",
        reactionType: "👍",
        userId: "user2",
      }),
    ).toBe(false);
  });

  test("remove reaction", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });

    const result = await t.mutation(api.lib.remove, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    expect(result.removed).toBe(true);

    const counts = await t.query(api.lib.getCounts, { targetId: "post1" });
    expect(counts).toEqual([]);
  });

  test("remove is idempotent", async () => {
    const t = convexTest(schema, modules);

    const result = await t.mutation(api.lib.remove, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    expect(result.removed).toBe(false);
  });

  test("list all reactions", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "👍",
      userId: "user1",
    });
    await t.mutation(api.lib.add, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user2",
    });

    const reactions = await t.query(api.lib.list, { targetId: "post1" });
    expect(reactions).toHaveLength(2);
    expect(reactions.every((r) => r.targetId === "post1")).toBe(true);
  });
});

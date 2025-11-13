import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Reactions } from "./index.js";
import type { DataModelFromSchemaDefinition } from "convex/server";
import {
  anyApi,
  queryGeneric,
  mutationGeneric,
  actionGeneric,
} from "convex/server";
import type {
  ApiFromModules,
  ActionBuilder,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";
import { v } from "convex/values";
import { defineSchema } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

// The schema for the tests
const schema = defineSchema({});
type DataModel = DataModelFromSchemaDefinition<typeof schema>;
// type DatabaseReader = GenericDatabaseReader<DataModel>;
const query = queryGeneric as QueryBuilder<DataModel, "public">;
const mutation = mutationGeneric as MutationBuilder<DataModel, "public">;
const action = actionGeneric as ActionBuilder<DataModel, "public">;

const reactions = new Reactions(components.reactions);

export const testQuery = query({
  args: { targetId: v.string() },
  returns: v.array(
    v.object({
      reactionType: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await reactions.getCounts(ctx, args.targetId);
  },
});

export const testMutation = mutation({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await reactions.add(
      ctx,
      args.targetId,
      args.reactionType,
      args.userId,
    );
  },
});

export const testAction = action({
  args: {
    targetId: v.string(),
    reactionType: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await reactions.add(
      ctx,
      args.targetId,
      args.reactionType,
      args.userId,
    );
  },
});

const testApi: ApiFromModules<{
  fns: {
    testQuery: typeof testQuery;
    testMutation: typeof testMutation;
    testAction: typeof testAction;
  };
}>["fns"] = anyApi["index.test"] as any;

describe("Reactions thick client", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("should make thick client", async () => {
    const c = new Reactions(components.reactions);
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      await c.add(ctx, "post1", "👍", "user1");
      const counts = await c.getCounts(ctx, "post1");
      expect(counts).toEqual([{ reactionType: "👍", count: 1 }]);
    });
  });
  test("should work from a test function", async () => {
    const t = initConvexTest(schema);
    const result = await t.mutation(testApi.testMutation, {
      targetId: "post1",
      reactionType: "❤️",
      userId: "user1",
    });
    expect(result).toBeNull();
  });
  test("remove reaction", async () => {
    const c = new Reactions(components.reactions);
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      // Add a reaction
      const result1 = await c.add(ctx, "post1", "🎉", "user1");
      expect(result1).toBeNull();

      // Remove it
      const result2 = await c.remove(ctx, "post1", "🎉", "user1");
      expect(result2).toBeNull();

      // Check counts are empty
      const counts = await c.getCounts(ctx, "post1");
      expect(counts).toEqual([]);
    });
  });
  test("hasUserReacted", async () => {
    const c = new Reactions(components.reactions);
    const t = initConvexTest(schema);
    await t.run(async (ctx) => {
      await c.add(ctx, "post1", "👍", "user1");
      expect(await c.hasUserReacted(ctx, "post1", "👍", "user1")).toBe(true);
      expect(await c.hasUserReacted(ctx, "post1", "❤️", "user1")).toBe(false);
    });
  });
});

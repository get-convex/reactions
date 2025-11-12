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

const reactions = new Reactions(components.reactions, {
  shards: {
    beans: 1,
    friends: 2,
  },
  defaultShards: 1,
});

export const testQuery = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await reactions.count(ctx, args.name);
  },
});

export const testMutation = mutation({
  args: { name: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    return await reactions.add(ctx, args.name, args.count);
  },
});

export const testAction = action({
  args: { name: v.string(), count: v.number() },
  handler: async (ctx, args) => {
    return await reactions.add(ctx, args.name, args.count);
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
      await c.add(ctx, "beans", 1);
      expect(await c.count(ctx, "beans")).toBe(1);
    });
  });
  test("should work from a test function", async () => {
    const t = initConvexTest(schema);
    const result = await t.mutation(testApi.testMutation, {
      name: "beans",
      count: 1,
    });
    expect(result).toBe(null);
  });
});

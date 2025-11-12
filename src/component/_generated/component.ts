/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      add: FunctionReference<
        "mutation",
        "internal",
        { reactionType: string; targetId: string; userId: string },
        { added: boolean },
        Name
      >;
      getCounts: FunctionReference<
        "query",
        "internal",
        { targetId: string },
        Array<{ count: number; reactionType: string }>,
        Name
      >;
      getUserReactions: FunctionReference<
        "query",
        "internal",
        { targetId: string; userId: string },
        Array<string>,
        Name
      >;
      hasUserReacted: FunctionReference<
        "query",
        "internal",
        { reactionType: string; targetId: string; userId: string },
        boolean,
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { targetId: string },
        Array<{
          _creationTime: number;
          _id: string;
          reactionType: string;
          targetId: string;
          userId: string;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { reactionType: string; targetId: string; userId: string },
        { removed: boolean },
        Name
      >;
      toggle: FunctionReference<
        "mutation",
        "internal",
        { reactionType: string; targetId: string; userId: string },
        { added: boolean },
        Name
      >;
    };
  };

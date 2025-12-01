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
        {
          allowMultipleReactions?: boolean;
          label: string;
          namespace?: string;
          targetId: string;
          userId: string;
        },
        null,
        Name
      >;
      deleteAllForTarget: FunctionReference<
        "mutation",
        "internal",
        { namespace?: string; targetId: string },
        null,
        Name
      >;
      getCounts: FunctionReference<
        "query",
        "internal",
        { namespace?: string; targetId: string },
        Array<{ count: number; label: string }>,
        Name
      >;
      getUserReactions: FunctionReference<
        "query",
        "internal",
        { namespace?: string; targetId: string; userId: string },
        Array<string>,
        Name
      >;
      hasUserReacted: FunctionReference<
        "query",
        "internal",
        { label: string; namespace?: string; targetId: string; userId: string },
        boolean,
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { namespace?: string; targetId: string },
        Array<{
          _creationTime: number;
          _id: string;
          label: string;
          namespace?: string;
          targetId: string;
          userId: string;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { label: string; namespace?: string; targetId: string; userId: string },
        null,
        Name
      >;
    };
  };

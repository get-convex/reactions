# Convex Component Template

This is a Convex component, ready to be published on npm.

To create your own component:

1. Run `node rename.mjs` to rename everything to your component's name.
1. Write code in src/component for your component.
1. Write code in src/client for the Class that interfaces with the component.
1. Write example usage in example/convex/example.ts.
1. Delete the text in this readme until `---` and flesh out the README.
1. Publish to npm with `npm run alpha` or `npm run release`.

To develop your component run a dev process in the example project:

```sh
npm i
npm run dev
```

`npm i` will do the install and an initial build. `npm run dev` will start a
file watcher to re-build the component, as well as the example project frontend
and backend, which does codegen and installs the component.

Modify the schema and index files in src/component/ to define your component.

Write a client for using this component in src/client/index.ts.

If you won't be adding frontend code (e.g. React components) to this component
you can delete the following:

- "./react" exports in package.json
- the "src/react/" directory

If you will be adding frontend code, add a peer dependency on React in
package.json.

### Component Directory structure

```
.
├── README.md           documentation of your component
├── package.json        component name, version number, other metadata
├── package-lock.json   Components are like libraries, package-lock.json
│                       is .gitignored and ignored by consumers.
├── src
│   ├── component/
│   │   ├── _generated/ Files here are generated for the component.
│   │   ├── convex.config.ts  Name your component here and use other components
│   │   ├── lib.ts    Define functions here and in new files in this directory
│   │   └── schema.ts   schema specific to this component
│   ├── client/index.ts "Thick" client code goes here.
│   └── react/          Code intended to be used on the frontend goes here.
│       │               Your are free to delete this if this component
│       │               does not provide code.
│       └── index.ts
├── example/            example Convex app that uses this component
│   └── convex/
│       ├── _generated/       Files here are generated for the example app.
│       ├── convex.config.ts  Imports and uses this component
│       ├── myFunctions.ts    Functions that use the component
│       └── schema.ts         Example app schema
└── dist/               Publishing artifacts will be created here.
```

---

# Convex Reactions Component

[![npm version](https://badge.fury.io/js/@example%2Freactions.svg)](https://badge.fury.io/js/@example%2Freactions)

<!-- START: Include on https://convex.dev/components -->

A Convex component for adding reactions (like emojis 👍❤️🎉) to any content in
your app. Perfect for social features, posts, comments, or any content that
users can react to.

**Features:**

- ✅ Idempotent add and remove operations
- ✅ Denormalized counts for fast aggregation
- ✅ Track which users reacted with what
- ✅ Support for arbitrary reaction types (emojis, custom reactions, etc.)
- ✅ All operations are idempotent (safe to call multiple times)
- ✅ **One reaction per user per target+namespace** - changing reactions
  automatically removes the previous one

Found a bug? Feature request?
[File it here](https://github.com/get-convex/reactions/issues).

## Pre-requisite: Convex

You'll need an existing Convex project to use the component. Convex is a hosted
backend platform, including a database, serverless functions, and a ton more you
can learn about [here](https://docs.convex.dev/get-started).

Run `npm create convex` or follow any of the
[quickstarts](https://docs.convex.dev/home) to set one up.

## Installation

Install the component package:

```sh
npm install @convex/reactions
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the
component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import reactions from "@convex/reactions/convex.config.js";

const app = defineApp();
app.use(reactions);

export default app;
```

## Usage

### Basic Setup

```ts
import { components } from "./_generated/api";
import { Reactions } from "@convex/reactions";

const reactions = new Reactions(components.reactions);
```

### Important: One Reaction Per User

Each user can only have **one reaction per target+namespace**. When a user
reacts with a different emoji, their previous reaction is automatically removed
and the counts are updated:

```ts
// User reacts with 👍
await reactions.add(ctx, "post-1", "👍", "user-1");
// Counts: 👍: 1

// User changes to ❤️ - their 👍 is automatically removed
await reactions.add(ctx, "post-1", "❤️", "user-1");
// Counts: ❤️: 1 (👍 count went to 0)
```

This makes the component perfect for:

- **Single-choice reactions** (like/unlike, upvote/downvote)
- **Emoji reactions** where users pick one emoji
- **Rating systems** where users can change their rating
- **Voting systems** where users can change their vote

If you need multiple reactions per user, use different **namespaces** for each
reaction category.

### Add a Reaction

Add a reaction to a target. If the user already has a different reaction on this
target, it will be replaced automatically:

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await reactions.add(ctx, args.postId, args.emoji, args.userId);
    return null;
  },
});
```

### Remove a Reaction

Remove a specific reaction from a target:

```ts
export const removeReaction = mutation({
  args: {
    postId: v.string(),
    emoji: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await reactions.remove(ctx, args.postId, args.emoji, args.userId);
    return null;
  },
});
```

### Get Reaction Counts

Get aggregated counts for all reactions on a target:

```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPostReactions = query({
  args: { postId: v.string() },
  returns: v.array(
    v.object({
      reactionType: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await reactions.getCounts(ctx, args.postId);
  },
});
// Returns: [{ reactionType: "👍", count: 5 }, { reactionType: "❤️", count: 3 }]
```

### Check User's Reactions

See what reactions a user has made on a specific target:

```ts
export const getUserReactions = query({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    return await reactions.getUserReactions(ctx, args.postId, args.userId);
  },
});
// Returns: ["👍", "❤️"] - the emojis this user has reacted with
```

### Check Specific Reaction

Check if a user has reacted with a specific reaction:

```ts
export const hasUserLiked = query({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return await reactions.hasUserReacted(ctx, args.postId, "👍", args.userId);
  },
});
```

### Using Namespaces

Namespaces allow you to have multiple independent reaction systems on the same
target. For example, you might want both "sentiment reactions" (👍❤️) and
"quality ratings" (⭐) on the same post:

```ts
// Sentiment reactions (user can have one in "sentiment" namespace)
await reactions.add(ctx, "post-1", "👍", "user-1", "sentiment");
// User changes their mind - this replaces 👍 in the "sentiment" namespace
await reactions.add(ctx, "post-1", "❤️", "user-1", "sentiment");

// Quality rating (separate namespace - can exist simultaneously)
await reactions.add(ctx, "post-1", "⭐", "user-1", "quality");

// Get counts for each namespace
const sentimentCounts = await reactions.getCounts(ctx, "post-1", "sentiment");
// Returns: [{ reactionType: "❤️", count: 1 }] - only the latest sentiment

const qualityCounts = await reactions.getCounts(ctx, "post-1", "quality");
// Returns: [{ reactionType: "⭐", count: 1 }]
```

Without a namespace (or `undefined`), all reactions are in the default
namespace. Namespaces ensure users can only react once per
`targetId + namespace` combination.

## API Reference

### Methods

All methods accept an optional `namespace` parameter to scope reactions to
different contexts.

#### `add(ctx, targetId, reactionType, userId, namespace?)`

Add a reaction. If the user already has this exact reaction, this is a no-op.
Otherwise, any existing reactions by this user on the target+namespace will be
removed first, then this reaction will be added.

- `namespace` (optional): Scope reactions to a specific namespace
- Returns: `{ added: boolean }` - false if the exact same reaction already
  existed

#### `remove(ctx, targetId, reactionType, userId, namespace?)`

Remove a reaction (idempotent - safe to call multiple times).

- `namespace` (optional): Scope reactions to a specific namespace
- Returns: `{ removed: boolean }` - false if didn't exist

#### `getCounts(ctx, targetId, namespace?)`

Get aggregated reaction counts for a target.

- `namespace` (optional): Filter to a specific namespace
- Returns: `Array<{ reactionType: string, count: number }>`

#### `list(ctx, targetId, namespace?)`

Get all individual reaction documents for a target.

- `namespace` (optional): Filter to a specific namespace
- Returns: Array of reaction documents with `_id`, `_creationTime`, `targetId`,
  `reactionType`, `userId`, `namespace`

#### `getUserReactions(ctx, targetId, userId, namespace?)`

Get all reaction types a user has used on a target.

- `namespace` (optional): Filter to a specific namespace
- Returns: `string[]` - array of reaction types

#### `hasUserReacted(ctx, targetId, reactionType, userId, namespace?)`

Check if a user has reacted with a specific reaction type.

- `namespace` (optional): Filter to a specific namespace
- Returns: `boolean`

### Re-exporting the API

You can directly re-export the component's API for convenience:

```ts
export const {
  add,
  remove,
  getCounts,
  list,
  getUserReactions,
  hasUserReacted,
} = reactions.api();
```

This allows clients to call these functions directly without wrapping them.

### HTTP Endpoints

You can expose reaction counts via HTTP for use in external applications,
webhooks, or public APIs. The `Reactions` class provides a `registerRoutes()`
method to easily add HTTP endpoints.

First, export your `Reactions` instance (e.g., in `convex/reactions.ts` or any
file):

```ts
import { components } from "./_generated/api";
import { Reactions } from "@convex/reactions";

export const reactions = new Reactions(components.reactions, {});
```

Then create an `http.ts` file in your `convex/` folder and register the routes:

```ts
import { httpRouter } from "convex/server";
import { reactions } from "./reactions";

const http = httpRouter();

// Register the reactions HTTP endpoint
reactions.registerRoutes(http, {
  path: "/reactions/getCounts",
});

export default http;
```

This creates a public endpoint at
`https://your-deployment.convex.site/reactions/getCounts?targetId=post-1` that
returns JSON like:

```json
[
  { "reactionType": "👍", "count": 5 },
  { "reactionType": "❤️", "count": 3 }
]
```

You can also include an optional `namespace` query parameter:
`/reactions/getCounts?targetId=post-1&namespace=sentiment`

## Data Model

The component uses two tables:

- **reactions**: Individual reactions (one per user + target + reactionType)
  - `targetId`: string - the ID of the thing being reacted to
  - `reactionType`: string - the reaction (e.g., "👍", "❤️")
  - `userId`: string - who reacted

- **reactionCounts**: Denormalized aggregates for fast queries
  - `targetId`: string
  - `reactionType`: string
  - `count`: number

See more example usage in [example.ts](./example/convex/example.ts).

<!-- END: Include on https://convex.dev/components -->

Run the example:

```sh
npm i
npm run dev
```

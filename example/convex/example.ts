import { mutation } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { Reactions } from "@convex/reactions";

const reactions = new Reactions(components.reactions, {});

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await reactions.add(ctx, "accomplishments");
  },
});

// Direct re-export of component's API.
export const { add, count } = reactions.api();

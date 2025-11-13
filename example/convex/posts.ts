/**
 * Post management functions.
 *
 * This demonstrates how to use the Reactions component with cascade delete
 * when removing content that has reactions.
 */
import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";
import { reactions } from "./example.js";

const SILLY_TITLES = [
  "Why My Cat Thinks It's a Pirate",
  "The Great Sock Disappearance Mystery",
  "I Tried to Teach My Plant to Dance",
  "Confessions of a Serial Snooze Button Hitter",
  "Why I Believe Pizza is a Vegetable",
  "The Day I Accidentally Joined a Flash Mob",
  "My Toaster Has Trust Issues",
  "I'm Convinced My Car Judges My Music Choices",
  "The Time I Mistook a Mop for a Person",
  "Why Dogs Are Better at Small Talk Than I Am",
  "My Battle with Self-Checkout Machines",
  "The Existential Crisis of a Rubber Duck",
  "I Named All My Houseplants After 80s Bands",
  "Why Pigeons Are Actually Government Drones",
  "My Spoon Collection is Out of Control",
  "The Chronicles of My WiFi Router",
  "I'm Starting a Band Called 'DNS Error'",
  "Why Penguins Would Make Terrible Roommates",
  "My Quest to Become Friends with Crows",
  "The Philosophical Implications of Bubble Wrap",
];

const SILLY_BODIES = [
  "And honestly, I don't think anyone was ready for what happened next. Let's just say it involved a lot of glitter and zero regrets.",
  "After extensive research (watching 3 YouTube videos), I've concluded this is both scientifically impossible and absolutely hilarious.",
  "My friends say I'm overthinking this. But when you've been up at 3 AM contemplating the deeper meaning, you start to see patterns everywhere.",
  "I documented everything with charts, graphs, and interpretive dance. The results speak for themselves.",
  "This changed my life in ways I never expected. Mostly in the grocery store produce aisle, but still.",
  "I'm not saying this is the most important discovery of our generation, but I'm also not NOT saying that.",
  "The real treasure was the friends we made along the way. Just kidding, there was no treasure and everyone left confused.",
  "Looking back, I realize this was either genius or complete nonsense. Possibly both. Definitely both.",
  "If you told me a year ago this would happen, I would have believed you because my life is basically a sitcom at this point.",
  "The moral of the story: sometimes the universe sends you signs. Sometimes those signs are just weird coincidences. This was definitely one of those.",
  "In conclusion, I have no regrets except for maybe all of them. Would recommend though.",
  "I tried to explain this to my therapist and they just started taking notes faster. Make of that what you will.",
  "Scientists hate this one weird trick! Mostly because it makes no logical sense whatsoever.",
  "This is either revolutionary or I need more sleep. Survey results are split 50/50.",
  "Somewhere between genius and madness lies this idea. I'll let you decide which side it's closer to.",
  "My life coach suggested I 'pursue my passions.' This is what happens when you take that too literally.",
  "Breaking news: Local person continues to make questionable life choices. More at 11.",
  "I'm calling it 'avant-garde.' Everyone else is calling it 'please stop.' Agree to disagree.",
  "This definitely happened and I have zero evidence to support any of it. You're welcome.",
  "Future historians will look back on this moment and think 'what were they thinking?' The answer is we weren't.",
];

/**
 * Create a new post
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.string(),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
    });
    return postId;
  },
});

/**
 * Generate a silly post with a random title and body
 */
export const generateSillyPost = mutation({
  args: {
    authorId: v.string(),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    // Pick random title and body
    const titleIndex = Math.floor(Math.random() * SILLY_TITLES.length);
    const bodyIndex = Math.floor(Math.random() * SILLY_BODIES.length);

    const title = SILLY_TITLES[titleIndex];
    const content = SILLY_BODIES[bodyIndex];

    const postId = await ctx.db.insert("posts", {
      title,
      content,
      authorId: args.authorId,
    });
    return postId;
  },
});

/**
 * Delete a post and all its reactions (cascade delete)
 *
 * This demonstrates how to properly clean up reactions when deleting content.
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // First, delete all reactions for this post
    // Use the post ID as the targetId
    await reactions.deleteAllForTarget(ctx, args.postId);

    // Then delete the post itself
    await ctx.db.delete(args.postId);
    return null;
  },
});

/**
 * List all posts
 */
export const listPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      authorId: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

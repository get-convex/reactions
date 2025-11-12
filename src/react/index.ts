"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

/**
 * A React hook for managing reactions on a target.
 *
 * @example
 * ```tsx
 * import { useReactions } from "@convex/reactions/react";
 * import { api } from "./convex/_generated/api";
 *
 * function Post({ postId, userId }) {
 *   const { counts, userReactions, toggle } = useReactions({
 *     targetId: postId,
 *     userId: userId,
 *     api: {
 *       getCounts: api.example.getCounts,
 *       getUserReactions: api.example.getUserReactions,
 *       toggle: api.example.toggle,
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {["👍", "❤️", "🎉"].map((emoji) => (
 *         <button
 *           key={emoji}
 *           onClick={() => toggle({ reactionType: emoji })}
 *           disabled={toggle.isLoading}
 *         >
 *           {emoji} {counts?.find((r) => r.reactionType === emoji)?.count || 0}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useReactions({
  targetId,
  userId,
  api,
}: {
  targetId: string;
  userId: string;
  api: {
    getCounts: FunctionReference<
      "query",
      "public",
      { targetId: string },
      Array<{ reactionType: string; count: number }>
    >;
    getUserReactions: FunctionReference<
      "query",
      "public",
      { targetId: string; userId: string },
      string[]
    >;
    toggle: FunctionReference<
      "mutation",
      "public",
      { targetId: string; reactionType: string; userId: string },
      { added: boolean }
    >;
  };
}) {
  const counts = useQuery(api.getCounts, { targetId });
  const userReactions = useQuery(api.getUserReactions, { targetId, userId });
  const toggleMutation = useMutation(api.toggle);

  const toggle = ({ reactionType }: { reactionType: string }) => {
    return toggleMutation({ targetId, reactionType, userId });
  };

  return {
    counts,
    userReactions,
    toggle,
  };
}

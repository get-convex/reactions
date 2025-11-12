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
 *   const { counts, userReactions, add, remove } = useReactions({
 *     targetId: postId,
 *     userId: userId,
 *     api: {
 *       getCounts: api.example.getCounts,
 *       getUserReactions: api.example.getUserReactions,
 *       add: api.example.add,
 *       remove: api.example.remove,
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {["👍", "❤️", "🎉"].map((emoji) => {
 *         const hasReacted = userReactions?.includes(emoji);
 *         return (
 *           <button
 *             key={emoji}
 *             onClick={() => {
 *               if (hasReacted) {
 *                 remove({ reactionType: emoji });
 *               } else {
 *                 add({ reactionType: emoji });
 *               }
 *             }}
 *           >
 *             {emoji} {counts?.find((r) => r.reactionType === emoji)?.count || 0}
 *           </button>
 *         );
 *       })}
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
    add: FunctionReference<
      "mutation",
      "public",
      { targetId: string; reactionType: string; userId: string },
      { added: boolean }
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { targetId: string; reactionType: string; userId: string },
      { removed: boolean }
    >;
  };
}) {
  const counts = useQuery(api.getCounts, { targetId });
  const userReactions = useQuery(api.getUserReactions, { targetId, userId });
  const addMutation = useMutation(api.add);
  const removeMutation = useMutation(api.remove);

  const add = ({ reactionType }: { reactionType: string }) => {
    return addMutation({ targetId, reactionType, userId });
  };

  const remove = ({ reactionType }: { reactionType: string }) => {
    return removeMutation({ targetId, reactionType, userId });
  };

  return {
    counts,
    userReactions,
    add,
    remove,
  };
}

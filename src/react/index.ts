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
 *                 remove({ label: emoji });
 *               } else {
 *                 add({ label: emoji });
 *               }
 *             }}
 *           >
 *             {emoji} {counts?.find((r) => r.label === emoji)?.count || 0}
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
      Array<{ label: string; count: number }>
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
      { targetId: string; label: string; userId: string },
      { added: boolean }
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { targetId: string; label: string; userId: string },
      { removed: boolean }
    >;
  };
}) {
  const counts = useQuery(api.getCounts, { targetId });
  const userReactions = useQuery(api.getUserReactions, { targetId, userId });
  const addMutation = useMutation(api.add);
  const removeMutation = useMutation(api.remove);

  const add = ({ label }: { label: string }) => {
    return addMutation({ targetId, label, userId });
  };

  const remove = ({ label }: { label: string }) => {
    return removeMutation({ targetId, label, userId });
  };

  return {
    counts,
    userReactions,
    add,
    remove,
  };
}

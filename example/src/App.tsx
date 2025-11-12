import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const [postId] = useState("demo-post-1");
  const [userId] = useState("demo-user-1");

  const reactionCounts = useQuery(api.example.getPostReactions, { postId });
  const userReactions = useQuery(api.example.getUserPostReactions, {
    postId,
    userId,
  });
  const toggleReaction = useMutation(api.example.toggleReaction);

  const emojis = ["👍", "❤️", "🎉", "🚀", "👀"];

  return (
    <>
      <h1>Reactions Example</h1>
      <div className="card">
        <h2>React to this post:</h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          {emojis.map((emoji) => {
            const count =
              reactionCounts?.find((r) => r.reactionType === emoji)?.count || 0;
            const hasReacted = userReactions?.includes(emoji);

            return (
              <button
                key={emoji}
                onClick={() =>
                  toggleReaction({
                    postId,
                    emoji,
                    userId,
                  })
                }
                style={{
                  fontSize: "24px",
                  padding: "10px 15px",
                  border: hasReacted ? "2px solid #646cff" : "1px solid #ccc",
                  borderRadius: "8px",
                  background: hasReacted ? "#646cff20" : "transparent",
                  cursor: "pointer",
                }}
              >
                {emoji} {count > 0 && count}
              </button>
            );
          })}
        </div>
        <p>
          See <code>example/convex/example.ts</code> for all the ways to use
          this component
        </p>
      </div>
    </>
  );
}

export default App;

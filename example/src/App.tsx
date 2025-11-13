import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";

// Generate a unique user ID per browser session
function getOrCreateUserId(): string {
  const storageKey = "reactions-demo-user-id";
  let userId = sessionStorage.getItem(storageKey);
  if (!userId) {
    userId = `user-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(storageKey, userId);
  }
  return userId;
}

// Generate a random color for the user badge
function getUserColor(userId: string): string {
  const colors = [
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
    "#14b8a6", // teal
  ];
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

function Post({ postId, userId }: { postId: string; userId: string }) {
  const reactionCounts = useQuery(api.example.getPostReactions, { postId });
  const userReactions = useQuery(api.example.getUserPostReactions, {
    postId,
    userId,
  });
  const addReaction = useMutation(api.example.addReaction);
  const removeReaction = useMutation(api.example.removeReaction);

  const emojis = ["👍", "❤️", "🎉", "🚀", "👀"];

  return (
    <div
      style={{
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "20px",
        background: "var(--card-bg)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h3 style={{ marginTop: 0, color: "var(--text-primary)", fontWeight: "600" }}>Sample Post #{postId.split("-")[1]}</h3>
      <p style={{ color: "var(--text-secondary)" }}>
        This is a demo post. React with emojis below!
      </p>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        {emojis.map((emoji) => {
          const count =
            reactionCounts?.find((r) => r.reactionType === emoji)?.count || 0;
          const hasReacted = userReactions?.includes(emoji);

          return (
            <button
              key={emoji}
              onClick={() => {
                if (hasReacted) {
                  removeReaction({ postId, emoji, userId });
                } else {
                  addReaction({ postId, emoji, userId });
                }
              }}
              style={{
                fontSize: "24px",
                padding: "12px 18px",
                border: hasReacted ? `2px solid var(--button-active-border)` : `1px solid var(--button-border)`,
                borderRadius: "12px",
                background: hasReacted ? "var(--button-active-bg)" : "var(--button-bg)",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                color: "var(--text-primary)",
                boxShadow: hasReacted ? `0 4px 20px var(--button-active-shadow)` : "none",
              }}
              title={
                hasReacted ? "Click to remove reaction" : "Click to react"
              }
            >
              {emoji} {count > 0 && <span style={{ fontSize: "16px" }}>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState<string>("");
  const userColor = getUserColor(userId);

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  const posts = ["post-1", "post-2", "post-3"];

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0 }}>Reactions Demo</h1>
        <div
          style={{
            padding: "10px 20px",
            borderRadius: "24px",
            background: `linear-gradient(135deg, ${userColor}dd, ${userColor})`,
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: `0 4px 20px ${userColor}50`,
            border: `1px solid var(--badge-border)`,
          }}
        >
          You: {userId}
        </div>
      </div>

      <div
        style={{
          background: "var(--info-bg)",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "30px",
          border: `1px solid var(--info-border)`,
          backdropFilter: "blur(10px)",
        }}
      >
        <p style={{ margin: "0 0 12px 0", fontSize: "15px", color: "var(--text-primary)", fontWeight: "600" }}>
          💡 <strong>Try this:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
          <li>Open this page in an incognito/private window</li>
          <li>You'll get a different user ID (different color badge)</li>
          <li>React to the posts and see them update in real-time!</li>
        </ul>
      </div>

      <div className="card">
        {posts.map((postId) => (
          <Post key={postId} postId={postId} userId={userId} />
        ))}
        <p style={{ marginTop: "30px", fontSize: "14px", color: "var(--text-muted)" }}>
          See <code style={{ background: "var(--code-bg)", padding: "4px 8px", borderRadius: "6px", color: "var(--code-text)", border: `1px solid var(--code-border)` }}>example/convex/example.ts</code> for all the ways to use
          this component
        </p>
      </div>
    </>
  );
}

export default App;

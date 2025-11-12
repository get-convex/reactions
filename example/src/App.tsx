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
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dfe6e9",
    "#fd79a8",
    "#fdcb6e",
    "#6c5ce7",
    "#a29bfe",
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
  const toggleReaction = useMutation(api.example.toggleReaction);

  const emojis = ["👍", "❤️", "🎉", "🚀", "👀"];

  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        background: "#1e1e1e",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#f0f0f0" }}>Sample Post #{postId.split("-")[1]}</h3>
      <p style={{ color: "#aaa" }}>
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
                border: hasReacted ? "2px solid #646cff" : "1px solid #555",
                borderRadius: "8px",
                background: hasReacted ? "#646cff40" : "#2a2a2a",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#fff",
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
            padding: "8px 16px",
            borderRadius: "20px",
            background: userColor,
            color: "#000",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          You: {userId}
        </div>
      </div>

      <div
        style={{
          background: "#2a2a2a",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "30px",
          color: "#e0e0e0",
        }}
      >
        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#e0e0e0" }}>
          💡 <strong>Try this:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#e0e0e0" }}>
          <li>Open this page in an incognito/private window</li>
          <li>You'll get a different user ID (different color badge)</li>
          <li>React to the posts and see them update in real-time!</li>
        </ul>
      </div>

      <div className="card">
        {posts.map((postId) => (
          <Post key={postId} postId={postId} userId={userId} />
        ))}
        <p style={{ marginTop: "30px", fontSize: "14px", color: "#aaa" }}>
          See <code style={{ background: "#2a2a2a", padding: "2px 6px", borderRadius: "4px", color: "#e0e0e0" }}>example/convex/example.ts</code> for all the ways to use
          this component
        </p>
      </div>
    </>
  );
}

export default App;

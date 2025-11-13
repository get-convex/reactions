import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

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

interface PostData {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  content: string;
  authorId: string;
}

function Post({ post, userId }: { post: PostData; userId: string }) {
  const postId = post._id;
  const reactionCounts = useQuery(api.example.getPostReactions, { postId });
  const userReactions = useQuery(api.example.getUserPostReactions, {
    postId,
    userId,
  });
  const addReaction = useMutation(api.example.addReaction);
  const removeReaction = useMutation(api.example.removeReaction);
  const deletePost = useMutation(api.posts.deletePost);

  const emojis = ["👍", "❤️", "🎉", "🚀", "👀"];
  
  // Construct the HTTP endpoint URL
  const convexUrl = (import.meta.env.VITE_CONVEX_URL).replace(".cloud", ".site");
  const httpEndpointUrl = `${convexUrl}/reactions/getCounts?targetId=${encodeURIComponent(postId)}`;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post? All reactions will be removed too.")) {
      await deletePost({ postId });
    }
  };

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
        position: "relative",
      }}
    >
      <button
        onClick={handleDelete}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "8px",
          padding: "8px 12px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#ef4444",
          fontWeight: "500",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
        }}
      >
        Delete Post
      </button>
      <h3 style={{ marginTop: 0, color: "var(--text-primary)", fontWeight: "600", paddingRight: "100px" }}>
        {post.title}
      </h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>
        {post.content}
      </p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
        Posted by {post.authorId} • {new Date(post._creationTime).toLocaleString()}
      </p>
      <p style={{ fontSize: "13px", marginTop: "8px" }}>
        <span style={{ color: "var(--text-muted)" }}>HTTP API: </span>
        <a 
          href={httpEndpointUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: "var(--link-color)", 
            textDecoration: "none",
            borderBottom: "1px dotted var(--link-color)"
          }}
        >
          View JSON counts →
        </a>
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

  const posts = useQuery(api.posts.listPosts);
  const generateSillyPost = useMutation(api.posts.generateSillyPost);

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  // Auto-generate a silly post if the list is empty on first load
  useEffect(() => {
    if (posts !== undefined && posts.length === 0 && userId) {
      generateSillyPost({ authorId: userId });
    }
  }, [posts, userId, generateSillyPost]);

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
        <div style={{ margin: 0, paddingLeft: "0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
          <div>Generate silly posts and add reactions</div>
          <div>Delete a post to see cascade deletion of reactions</div>
          <div>Open in incognito/private to see real-time updates</div>
        </div>
      </div>

      <button
        onClick={() => generateSillyPost({ authorId: userId })}
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "16px 32px",
          fontSize: "18px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
          transition: "all 0.3s",
          width: "100%",
          marginBottom: "30px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 25px rgba(139, 92, 246, 0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)";
        }}
      >
        🎲 Generate Silly Post
      </button>

      <div className="card">
        {posts === undefined ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No posts yet. Generate a silly post to get started!
          </p>
        ) : (
          posts.map((post) => (
            <Post key={post._id} post={post} userId={userId} />
          ))
        )}
        <p style={{ marginTop: "30px", fontSize: "14px", color: "var(--text-muted)" }}>
          See <code style={{ background: "var(--code-bg)", padding: "4px 8px", borderRadius: "6px", color: "var(--code-text)", border: `1px solid var(--code-border)` }}>example/convex/example.ts</code> for reactions usage
          and <code style={{ background: "var(--code-bg)", padding: "4px 8px", borderRadius: "6px", color: "var(--code-text)", border: `1px solid var(--code-border)` }}>posts.ts</code> for post management
        </p>
      </div>
    </>
  );
}

export default App;

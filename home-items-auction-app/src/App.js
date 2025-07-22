// src/App.js
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import "./App.css";
import { initializeFirebase } from "./firebase";
import Panel from "./panel";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    initializeFirebase().then(({ auth }) => {
      setAuth(auth);
      auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
    });
  }, []);

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        border: "2px solid #555",
        padding: "0",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        {user ? (
          <button
            onClick={handleSignOut}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        )}
      </div>

      <div
        style={{
          width: "85vw",
          height: "85vh",
          maxWidth: "none",
          minWidth: "0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {user ? (
          <Panel />
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: "1.2rem",
            }}
          >
            Please sign in to view auction items
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

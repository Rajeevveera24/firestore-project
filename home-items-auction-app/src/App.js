// src/App.js
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import "./App.css";
import Browse from "./browser"; // Import new Browse component
import BudgetDisplay from "./bugdet_display";
import Cart from "./cart";
import { initializeFirebase } from "./firebase";
import Panel from "./panel";
import Sidebar from "./sidebar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);
  const [app, setApp] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("welcome");
  const [budget, setBudget] = useState(7000);
  const [joinedAuction, setJoinedAuction] = useState(false);

  useEffect(() => {
    initializeFirebase().then(({ auth, app }) => {
      setAuth(auth);
      setApp(app);
      auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
    });
  }, []);

  const handleBudgetUpdate = (newBudget) => {
    setBudget(newBudget);
  };

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const functions = getFunctions();
      const saveUserInfo = httpsCallable(functions, "saveUserInfo");

      console.log("User data:", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        emailVerified: user.emailVerified,
        metadata: user.metadata,
        providerData: user.providerData,
      });
      await saveUserInfo({
        email: user.email,
        name: user.displayName,
        age: 18,
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setIsSidebarOpen(false);
      setJoinedAuction(false);
      setCurrentPage("welcome");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleJoinAuction = () => {
    setJoinedAuction(true);
    setCurrentPage("auction");
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
      {user && (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          onSignOut={handleSignOut}
          showSignOut={false}
        />
      )}

      {user && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            gap: "10px",
          }}
        >
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
        </div>
      )}

      <div
        style={{
          width: isSidebarOpen ? "calc(85vw - 250px)" : "85vw",
          marginLeft: isSidebarOpen ? "250px" : "0",
          height: "85vh",
          maxWidth: "none",
          minWidth: "0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          transition: "all 0.3s ease-in-out",
        }}
      >
        {user ? (
          <>
            {!joinedAuction ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <h2>Welcome to the Auction</h2>
                <button
                  onClick={handleJoinAuction}
                  style={{
                    padding: "15px 30px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                >
                  Join Live Auction
                </button>
              </div>
            ) : (
              <>
                {currentPage === "auction" ? (
                  <Panel app={app} user={user} />
                ) : currentPage === "cart" ? (
                  <Cart app={app} user={user} />
                ) : currentPage === "browse" ? (
                  <Browse app={app} user={user} />
                ) : null}
                <BudgetDisplay app={app} user={user} />
              </>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "#666",
                fontSize: "1.2rem",
              }}
            >
              Please sign in to view auction items
            </div>
            <button
              onClick={handleSignIn}
              style={{
                padding: "12px 24px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

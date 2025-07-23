// src/App.js
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import "./App.css";
import BudgetDisplay from "./bugdet_display";
import Cart from "./cart"; // You'll need to create this component
import { initializeFirebase } from "./firebase";
import Panel from "./panel";
import Sidebar from "./sidebar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);
  const [app, setApp] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("auction");
  const [budget, setBudget] = useState(7000);

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
      // First sign in with popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // After successful sign in, the user is authenticated
      // Now when we call the Cloud Function, Firebase automatically
      // adds the auth context with the user's credentials
      const functions = getFunctions();
      const saveUserInfo = httpsCallable(functions, "saveUserInfo");

      // Call the function with the user data
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
        age: 18, // Default age value, you may want to collect this from the user
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
          width: isSidebarOpen ? "calc(85vw - 250px)" : "85vw", // Adjust width based on sidebar
          marginLeft: isSidebarOpen ? "250px" : "0", // Add margin when sidebar is open
          height: "85vh",
          maxWidth: "none",
          minWidth: "0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          transition: "all 0.3s ease-in-out", // Smooth transition
        }}
      >
        {user ? (
          <>
            {currentPage === "auction" ? (
              <Panel
                app={app}
                user={user}
                // budget={budget}
                // onBudgetUpdate={handleBudgetUpdate}
              />
            ) : currentPage === "cart" ? (
              <Cart app={app} user={user} />
            ) : currentPage === "browse" ? (
              <Cart app={app} user={user} />
            ) : null}
            <BudgetDisplay app={app} user={user} />
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

import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

const BudgetDisplay = ({ app, user }) => {
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (!app || !user) return;

    const db = getFirestore(app);
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setBudget(userData.budget || 0);
      }
    });

    return () => unsubscribe();
  }, [app, user]);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginTop: "20px",
        textAlign: "center",
      }}
    >
      <h3 style={{ margin: 0, color: "#2c3e50" }}>Current Budget</h3>
      <div
        style={{
          fontSize: "24px",
          color: budget > 1000 ? "#27ae60" : "#e74c3c",
          fontWeight: "bold",
        }}
      >
        ${budget.toLocaleString()}
      </div>
    </div>
  );
};

export default BudgetDisplay;

import {
  collectionGroup,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

const Cart = ({ app, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const db = getFirestore(app);
        const collections = ["modern", "luxury", "budget"];
        let allItems = [];

        for (const collectionName of collections) {
          const subcollectionRef = collectionGroup(db, collectionName);
          //   console.log(user.uid);
          const q = query(subcollectionRef, where("buyer", "==", user.uid));

          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allItems = [...allItems, ...items];
        }

        setCartItems(allItems);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (user) {
      fetchCartItems();
    }
  }, [app, user]);

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p>Loading cart items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div style={{ width: "100%", maxWidth: "800px" }}>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>{item.name}</h3>
                <p>Final Price: ${item.final_price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;

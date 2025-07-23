import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

const Browse = ({ app, user }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [unsubscribes, setUnsubscribes] = useState([]);
  const [connections, setConnections] = useState({});
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [userEmails, setUserEmails] = useState({});

  const types = ["all", "luxury", "budget", "modern"];
  const connectionTypes = ["friends"]; // Only show friends for filtering

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      const db = getFirestore(app);
      const userRef = doc(db, "users", user.uid);

      let allConnections = {};
      let connectedIds = [];

      // Only fetch friends collection
      const friendsRef = collection(db, "users", userRef.id, "friends");
      const snapshot = await getDocs(friendsRef);
      allConnections["friends"] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      connectedIds = snapshot.docs.map((doc) => doc.id);

      setConnections(allConnections);
      setConnectedUsers([user.uid, ...connectedIds]);

      // Store user's own email
      setUserEmails((prev) => ({
        ...prev,
        [user.uid]: user.email,
      }));

      // Store friends' emails
      snapshot.docs.forEach((doc) => {
        const friendData = doc.data();
        setUserEmails((prev) => ({
          ...prev,
          [doc.id]: friendData.email,
        }));
      });
    };

    if (user) {
      fetchConnectedUsers();
    }
  }, [app, user]);

  useEffect(() => {
    const fetchCategories = async () => {
      const db = getFirestore(app);
      const itemsSnapshot = await getDocs(collection(db, "items"));
      const categorySet = new Set();
      itemsSnapshot.forEach((doc) => {
        categorySet.add(doc.id);
      });
      setCategories(["all", ...Array.from(categorySet)]);
    };

    const fetchItems = async () => {
      const db = getFirestore(app);
      const allItems = [];
      const newUnsubscribes = [];

      unsubscribes.forEach((unsub) => unsub());

      for (const type of types.filter((t) => t !== "all")) {
        const categoriesRef = collection(db, "items");
        const categoryDocs = await getDocs(categoriesRef);

        for (const categoryDoc of categoryDocs.docs) {
          const itemsRef = collection(db, "items", categoryDoc.id, type);
          const itemsSnapshot = await getDocs(itemsRef);

          itemsSnapshot.forEach((doc) => {
            const itemData = doc.data();

            // Include all items that either:
            // 1. Have no buyer/bidder
            // 2. The user is the buyer/bidder
            // 3. A friend is the buyer/bidder
            if (
              (!itemData.buyer && !itemData.current_bidder) ||
              itemData.buyer === user.uid ||
              itemData.current_bidder === user.uid ||
              connectedUsers.includes(itemData.buyer) ||
              connectedUsers.includes(itemData.current_bidder)
            ) {
              allItems.push({
                id: doc.id,
                category: categoryDoc.id,
                type,
                ...itemData,
              });

              const unsubscribe = onSnapshot(doc.ref, (snapshot) => {
                const updatedData = snapshot.data();
                setItems((prevItems) => {
                  const newItems = [...prevItems];
                  const index = newItems.findIndex(
                    (item) => item.id === doc.id
                  );
                  if (index !== -1) {
                    newItems[index] = {
                      id: doc.id,
                      category: categoryDoc.id,
                      type,
                      ...updatedData,
                    };
                  }
                  return newItems;
                });
              });

              newUnsubscribes.push(unsubscribe);
            }
          });
        }
      }

      setItems(allItems);
      setFilteredItems(allItems);
      setUnsubscribes(newUnsubscribes);
      setLoading(false);
    };

    if (connectedUsers.length > 0) {
      fetchCategories();
      fetchItems();
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [app, connectedUsers, user.uid]);

  useEffect(() => {
    let filtered = [...items];

    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected friend's activity (buying or bidding)
    if (selectedConnection !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.buyer === selectedConnection ||
          item.current_bidder === selectedConnection
      );
    }

    setFilteredItems(filtered);
  }, [selectedType, selectedCategory, searchTerm, items, selectedConnection]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          padding: "20px 0",
          zIndex: 1000,
        }}
      >
        <h2>Browse Items</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <label htmlFor="search">Search:</label>
            <input
              id="search"
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px",
                width: "200px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginLeft: "5px",
              }}
            />
          </div>

          <div>
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginLeft: "5px",
              }}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginLeft: "5px",
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="connections">Filter by Friend:</label>
            <select
              id="connections"
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginLeft: "5px",
              }}
            >
              <option value="all">All Items</option>
              {connections.friends?.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          overflowY: "auto",
          padding: "10px",
          flex: 1,
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>{item.name}</h3>
            <p style={{ margin: "0 0 10px 0", color: "#666" }}>
              {item.description}
            </p>
            <div style={{ margin: "10px 0", fontSize: "0.9rem" }}>
              {item.is_bidding_open ? (
                <>
                  <div>
                    Current Bidder:{" "}
                    {item.current_bidder
                      ? userEmails[item.current_bidder] || "Unknown"
                      : "No bids yet"}
                  </div>
                  <div>Current Bid: ${item.current_bid || item.price}</div>
                </>
              ) : (
                <div>
                  {item.buyer
                    ? `Purchased by: ${userEmails[item.buyer] || "Unknown"}`
                    : "Bidding not open"}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
                ${item.price}
              </span>
              <span
                style={{
                  backgroundColor:
                    item.type === "luxury"
                      ? "#FFD700"
                      : item.type === "budget"
                      ? "#4CAF50"
                      : "#2196F3",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "0.8rem",
                }}
              >
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;

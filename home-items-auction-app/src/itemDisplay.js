import React, { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const ItemDetails = ({ title, app, user }) => {
  const [itemData, setItemData] = useState({});
  const [error, setError] = useState(null);
  const [hasBid, setHasBid] = useState(false);
  const [currentDocRef, setCurrentDocRef] = useState(null);
  const [notification, setNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userRef, setUserRef] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState(null);

  useEffect(() => {
    if (user) {
      const db = getFirestore(app);
      const ref = doc(db, "users", user.uid);
      setUserRef(ref);

      getDoc(ref).then((docSnap) => {
        if (docSnap.exists()) {
          setUserDoc(docSnap);
        }
      });
    }
  }, [app, user]);

  const fetchNextAvailableItem = async () => {
    if (!title) return;

    try {
      const db = getFirestore(app);
      const subcollections = ["budget", "luxury", "modern"];

      // Clean up existing listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      // Reset bid state for new item
      setHasBid(false);
      setTimeLeft(30);

      for (const subcollection of subcollections) {
        const subcollectionRef = collection(db, "items", title, subcollection);
        const q = query(subcollectionRef, where("is_bidding_open", "==", true));
        const querySnapshot = await getDocs(q);

        // Get first available item
        const availableDoc = querySnapshot.docs[0];
        if (availableDoc) {
          // Set up real-time listener
          const unsubscribe = onSnapshot(availableDoc.ref, (snapshot) => {
            const data = snapshot.data();
            if (data) {
              if (!data.is_bidding_open) {
                // Item was just purchased
                setNotification(
                  "Item has been purchased! Finding next available item..."
                );
                setTimeout(() => {
                  setNotification(null);
                  fetchNextAvailableItem(); // Fetch next item
                }, 3000);
                return;
              }

              // Check if outbid
              if (
                itemData.current_bidder === user.uid &&
                data.current_bidder !== user.uid
              ) {
                setNotification("Another user has placed a new bid!");
                setHasBid(false);
                setTimeout(() => setNotification(null), 5000);
              }

              setItemData(data);
              setCurrentDocRef(availableDoc.ref);
              if (data.time_left) {
                setTimeLeft(data.time_left);
              }
            }
          });

          setUnsubscribeSnapshot(() => unsubscribe);
          return; // Exit after finding first available item
        }
      }

      // If we get here, no items were found
      setItemData({});
      setCurrentDocRef(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchNextAvailableItem();

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [title, app]);

  // Timer effect for bid owner
  useEffect(() => {
    let timer;
    if (itemData.current_bidder === user.uid && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Update other users every 5 seconds
          if (newTime % 5 === 0 && currentDocRef) {
            updateDoc(currentDocRef, {
              time_left: newTime,
            });
          }
          // When timer hits 0, close bidding and set buyer
          if (newTime === 0 && currentDocRef && userDoc) {
            const userData = userDoc.data();
            const currentBudget = userData.budget || 0;
            updateDoc(userRef, {
              budget: currentBudget - itemData.current_bid,
            });
            updateDoc(currentDocRef, {
              is_bidding_open: false,
              buyer: user.uid,
              time_left: 0,
              final_price: itemData.current_bid,
            });
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    itemData.current_bidder,
    user.uid,
    currentDocRef,
    itemData.current_bid,
    userRef,
    userDoc,
  ]);

  const handleBid = async () => {
    if (!currentDocRef) return;

    const newBid = (itemData.current_bid || itemData.price) + 25;

    try {
      await updateDoc(currentDocRef, {
        current_bid: newBid,
        current_bidder: user.uid,
        bidder_email: user.email,
        time_left: 30,
        last_bid_timestamp: new Date().toISOString(),
      });

      setTimeLeft(30);
      setHasBid(true);
    } catch (err) {
      setError("Failed to place bid: " + err.message);
    }
  };

  const handlePass = () => {
    // Just mark as passed for this user
    setHasBid(true);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {notification && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {notification}
        </div>
      )}
      <p
        style={{ fontWeight: "bold", textAlign: "center", fontSize: "0.9rem" }}
      >
        {itemData.name || "Loading..."}
      </p>
      {itemData.name ? (
        <div>
          <p style={{ fontSize: "0.7rem" }}>Price: ${itemData.price}</p>
          <p style={{ fontSize: "0.7rem" }}>
            Current Bid: ${itemData.current_bid || " - "}
          </p>
          <p style={{ fontSize: "0.7rem" }}>
            Current Bidder: {itemData.bidder_email || " - "}
          </p>
          <p style={{ fontSize: "0.7rem" }}>Time Left: {timeLeft} seconds</p>

          {!hasBid && itemData.is_bidding_open && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button
                onClick={handleBid}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                }}
              >
                Bid (+$25)
              </button>
              <button
                onClick={handlePass}
                disabled={itemData.current_bidder === user.uid}
                style={{
                  padding: "5px 10px",
                  backgroundColor:
                    itemData.current_bidder === user.uid ? "#ccc" : "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor:
                    itemData.current_bidder === user.uid
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "0.7rem",
                }}
              >
                Pass
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "0.7rem" }}>No items on auction right now</p>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;

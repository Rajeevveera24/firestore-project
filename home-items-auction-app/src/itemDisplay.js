import React, { useEffect, useState } from "react";

import {
  collection,
  doc,
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
  const [timeLeft, setTimeLeft] = useState(20);
  const [userRef, setUserRef] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState(null);
  const [unsubscribeUserSnapshot, setUnsubscribeUserSnapshot] = useState(null);
  const [passedItems, setPassedItems] = useState([]);

  useEffect(() => {
    if (user) {
      const db = getFirestore(app);
      const ref = doc(db, "users", user.uid);
      setUserRef(ref);

      // Set up real-time listener for user document
      const unsubscribe = onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) {
          setUserDoc(docSnap);
        }
      });

      setUnsubscribeUserSnapshot(() => unsubscribe);

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [app, user]);

  const fetchNextAvailableItem = async (skipItemIds = []) => {
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
      setTimeLeft(20);

      for (const subcollection of subcollections) {
        const subcollectionRef = collection(db, "items", title, subcollection);
        const q = query(subcollectionRef, where("is_bidding_open", "==", true));
        const querySnapshot = await getDocs(q);

        // Get first available item that hasn't been passed
        const availableDoc = querySnapshot.docs.find(
          (doc) => !skipItemIds.includes(doc.id)
        );
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
                  fetchNextAvailableItem(skipItemIds); // Fetch next item
                }, 3000);
                return;
              }

              // Check if current bidder changed
              if (data.current_bidder !== itemData.current_bidder) {
                setHasBid(false); // Re-enable bidding when current bidder changes

                // Show outbid notification if user was previous bidder
                if (itemData.current_bidder === user.uid) {
                  setNotification("Another user has placed a new bid!");
                  setTimeout(() => setNotification(null), 5000);
                }
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
    fetchNextAvailableItem(passedItems);

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
          if (currentDocRef) {
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
        current_bidder_email: user.email,
        time_left: 20,
        last_bid_timestamp: new Date().toISOString(),
      });

      setTimeLeft(20);
      setHasBid(true);
    } catch (err) {
      setError("Failed to place bid: " + err.message);
    }
  };

  const handlePass = () => {
    if (!currentDocRef) return;

    // Add current item to passed items list
    setPassedItems((prev) => [...prev, currentDocRef.id]);

    // Show notification
    setNotification("Finding next available item...");

    // Fetch next available item that hasn't been passed
    fetchNextAvailableItem([...passedItems, currentDocRef.id]);

    // Clear notification after delay
    setTimeout(() => setNotification(null), 2000);
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
            Current Bidder: {itemData.current_bidder_email || " - "}
          </p>
          <p style={{ fontSize: "0.7rem", color: "red" }}>
            Time Left: {timeLeft} seconds
          </p>

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
              disabled={hasBid || !itemData.is_bidding_open}
              style={{
                padding: "5px 10px",
                backgroundColor:
                  hasBid || !itemData.is_bidding_open ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor:
                  hasBid || !itemData.is_bidding_open
                    ? "not-allowed"
                    : "pointer",
                fontSize: "0.7rem",
              }}
            >
              Bid (+$25)
            </button>
            <button
              onClick={handlePass}
              disabled={
                hasBid ||
                !itemData.is_bidding_open ||
                itemData.current_bidder === user.uid
              }
              style={{
                padding: "5px 10px",
                backgroundColor:
                  hasBid ||
                  !itemData.is_bidding_open ||
                  itemData.current_bidder === user.uid
                    ? "#ccc"
                    : "#f44336",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor:
                  hasBid ||
                  !itemData.is_bidding_open ||
                  itemData.current_bidder === user.uid
                    ? "not-allowed"
                    : "pointer",
                fontSize: "0.7rem",
              }}
            >
              Pass
            </button>
          </div>
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

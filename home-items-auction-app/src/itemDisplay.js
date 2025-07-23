import React, { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";

// const ItemDetails = ({ title }) => {
//   const [itemData, setItemData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showBidButtons, setShowBidButtons] = useState(true);
//   const [isBidding, setIsBidding] = useState(false);

//   useEffect(() => {
//     let unsubscribe = null;

//     const setupItemListener = async () => {
//       try {
//         const itemRef = db.collection("items").doc(title);
//         // Log all collections
//         const collections = await itemRef.listCollections();
//         collections.forEach((collection) => {
//           console.log("Collection:", collection.id);
//         });
//         unsubscribe = itemRef.onSnapshot(
//           (doc) => {
//             if (doc.exists) {
//               const data = doc.data();
//               if (data.status === "available" || isBidding) {
//                 setItemData(data);
//                 setShowBidButtons(data.status === "available");
//                 setLoading(false);
//               } else {
//                 // Item is not available and user isn't bidding, reset state
//                 setItemData({});
//                 setShowBidButtons(false);
//                 setLoading(true);
//               }
//             } else {
//               setError("Item not found");
//               setLoading(false);
//             }
//           },
//           (err) => {
//             console.error("Error watching document:", err);
//             setError(err.message);
//             setLoading(false);
//           }
//         );
//       } catch (err) {
//         console.error("Error setting up listener:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     setupItemListener();

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, [title, isBidding]);

//   const handleBid = async () => {
//     try {
//       const itemRef = db.collection("items").doc(title);
//       await itemRef.update({
//         currentBid: (itemData.currentBid || 0) + itemData.bidIncrement,
//         lastBidder: "", // Assuming user object is available
//       });
//       setIsBidding(true);
//       setShowBidButtons(false);
//     } catch (err) {
//       console.error("Error placing bid:", err);
//       setError(err.message);
//     }
//   };

//   const handlePass = () => {
//     setShowBidButtons(false);
//     setItemData({});
//     setLoading(true);
//   };

//   if (loading) {
//     return <div>Waiting for available items...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!itemData.currentBid && !showBidButtons) {
//     return <div>Waiting for next item...</div>;
//   }

//   return (
//     <div>
//       <p style={{ fontWeight: "bold", textAlign: "center" }}>{title}</p>
//       <p>Current Bid: ${itemData.currentBid || 0}</p>
//       <p>Time Left: {itemData.timeLeft || "N/A"}</p>
//       <p>Description: {itemData.description || "No description available"}</p>

//       {showBidButtons && (
//         <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
//           <button
//             onClick={handleBid}
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#4CAF50",
//               color: "white",
//               border: "none",
//               borderRadius: "4px",
//               cursor: "pointer",
//             }}
//           >
//             Bid (${(itemData.currentBid || 0) + (itemData.bidIncrement || 5)})
//           </button>
//           <button
//             onClick={handlePass}
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#f44336",
//               color: "white",
//               border: "none",
//               borderRadius: "4px",
//               cursor: "pointer",
//             }}
//           >
//             Pass
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

const ItemDetails = ({ title, app, user }) => {
  const [itemData, setItemData] = useState({});
  const [error, setError] = useState(null);
  //   const [collections, setCollections] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const fetchData = async () => {
      try {
        const subcollections = ["budget", "luxury", "modern"];
        const unsubscribers = [];

        for (const subcollection of subcollections) {
          const subcollectionRef = collection(
            db,
            "items",
            title,
            subcollection
          );
          const querySnapshot = await getDocs(subcollectionRef);

          querySnapshot.forEach((doc) => {
            const unsubscribe = onSnapshot(doc.ref, (snapshot) => {
              const data = snapshot.data();
              if (data && data.is_bidding_open) {
                // Trigger callback when is_bidding_open is set
                setItemData(data);
              }
            });
            unsubscribers.push(unsubscribe);
          });
        }

        // Cleanup function to unsubscribe all listeners
        return () => {
          unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
      } catch (err) {
        setError(err.message);
      }
    };

    if (title) {
      fetchData();
    }
  }, [title, app]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
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
            Current Bidder: {itemData.bidder || " - "}
          </p>
          <p style={{ fontSize: "0.7rem" }}>
            Time Left: {itemData.time_left || " - "}
          </p>
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

/**
 * index.js
 *
 * This file contains Firebase Functions that handle user data management.
 * These functions can be called directly from the frontend application.
 */

// Import the necessary Firebase Functions and Admin SDK modules

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

const { onCall, HttpsError } = require("firebase-functions/v2/https");

const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK to interact with Firebase services
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get a reference to the Firestore database service
const db = admin.firestore();

/**
 * @name saveUserInfo
 * @type {functions.HttpsFunction}
 *
 * An HTTPS callable function that saves or updates user information in Firestore.
 * Can be called directly from the frontend with user data.
 *
 * @param {Object} data - The user data object containing profile information
 * @returns {Promise<Object>} A promise that resolves with a success message
 */
exports.saveUserInfo = onCall({ cors: true }, async (request) => {
  // Ensure the request is authenticated
  if (!request.auth) {
    logger.error("Unauthenticated request received");
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  try {
    const userProfile = {
      email: request.data.email,
      name: request.data.name || "New User",
      age: request.data.age || 18,
      budget: request.data.budget || 7000,
      lastLogin: admin.firestore.Timestamp.now(),
    };

    console.log("Received user data:", request.data);

    // Check if document already exists for this user
    const userDoc = await db.collection("users").doc(request.auth.uid).get();

    if (userDoc.exists) {
      return {
        success: true,
        message: "User already exists",
        exists: true,
      };
    }

    // For new users, add createdAt timestamp
    userProfile.createdAt = admin.firestore.Timestamp.now();

    // Save to Firestore using auth uid as document ID
    await db.collection("users").doc(request.auth.uid).set(userProfile);

    logger.info(`User ${userProfile.name} info saved successfully`);

    return {
      success: true,
      message: "User information saved successfully",
      userId: request.auth.uid,
    };
  } catch (error) {
    logger.error("Error saving user information:", error);
    throw new HttpsError("internal", "Error saving user information", error);
  }
});

// exports.onItemPurchased = onDocumentUpdated(
//   "items/{itemId}/{collection}/{docId}",
//   async (event) => {
//     // Only proceed if collection is one of luxury, modern, budget
//     const validCollections = ["luxury", "modern", "budget"];
//     if (!validCollections.includes(event.params.collection)) {
//       return;
//     }

//     const newData = event.data.after.data();
//     const previousData = event.data.before.data();

//     // Only proceed if buyer field was just set (wasn't set before but is now)
//     if (!previousData.buyer && newData.buyer) {
//       try {
//         // Get the buyer's user document
//         const userRef = db.collection("users").doc(newData.buyer);
//         const userDoc = await userRef.get();

//         if (!userDoc.exists) {
//           logger.error(`User document ${newData.buyer} not found`);
//           return;
//         }

//         const userData = userDoc.data();
//         const currentBudget = userData.budget || 0;
//         const purchasePrice = newData.final_price || 0;

//         // Update user's budget
//         await userRef.update({
//           budget: currentBudget - purchasePrice,
//         });

//         logger.info(
//           `Updated budget for user ${newData.buyer}. New budget: ${
//             currentBudget - purchasePrice
//           }`
//         );
//       } catch (error) {
//         logger.error("Error updating user budget:", error);
//         throw new HttpsError("internal", "Error updating user budget", error);
//       }
//     }
//   }
// );

/**
 * index.js
 *
 * This file contains Firebase Functions that handle user data management.
 * These functions can be called directly from the frontend application.
 */

// Import the necessary Firebase Functions and Admin SDK modules
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
      lastLogin: admin.firestore.Timestamp.now(),
    };

    console.log("Received user data:", request.data);

    // Check if user with same email and name already exists
    const existingUsers = await db
      .collection("users")
      .where("email", "==", userProfile.email)
      .where("name", "==", userProfile.name)
      .get();

    if (!existingUsers.empty) {
      return {
        success: true,
        message: "User with this email and name combination already exists",
        exists: true,
      };
    }

    // For new users, add createdAt timestamp and required fields
    userProfile.createdAt = admin.firestore.Timestamp.now();

    // Save to Firestore with auto-generated ID
    const docRef = await db.collection("users").add({
      name: userProfile.name,
      email: userProfile.email,
      age: userProfile.age,
      createdAt: userProfile.createdAt,
    });

    logger.info(`User ${userProfile.name} info saved successfully`);

    return {
      success: true,
      message: "User information saved successfully",
      userId: docRef.id,
    };
  } catch (error) {
    logger.error("Error saving user information:", error);
    throw new HttpsError("internal", "Error saving user information", error);
  }
});

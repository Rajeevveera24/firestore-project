# Home Items Auction App

A real-time auction application for home decor and furniture items built with React and Firebase.

## Overview

This application allows users to participate in simultaneous auctions across multiple categories of home items. Users can bid on items in real-time, with live updates on current bids, time remaining, and item availability.

## Features

- Real-time bidding system with live updates
- Six simultaneous auction panels for different item categories:
  - Desk Chairs
  - Sofas
  - Mattresses
  - TVs
  - Dining Tables
  - Organizers
- User authentication via Firebase Auth
- Filtering and search capabilities
- Timed auction rounds (5-minute duration)
- User wallet/budget tracking
- Friend connections and activity tracking

## Tech Stack

- React.js - Frontend framework
- Firebase
  - Firestore - Real-time database
  - Authentication - User management
  - Hosting - Application deployment
- JavaScript/ES6+

## Data Model

### Users Collection

- **Fields:**

  - `uid` (string) - Firebase Auth user ID
  - `email` (string) - User's email address
  - `displayName` (string) - User's display name
  - `budget` (number) - User's current wallet balance
  - `createdAt` (timestamp) - When user account was created
  - `lastActive` (timestamp) - Last user activity timestamp

- **Subcollections:**
  - `friends/` - Collection of connected users
    - Document ID: Friend's uid
    - Fields:
      - `email` (string) - Friend's email
      - `connectedAt` (timestamp) - When connection was made

### Items Collection

- **Document ID:** Category name (chairs, sofas, etc)
- **Subcollections:**

  - `budget/` - Budget tier items
  - `luxury/` - Luxury tier items
  - `modern/` - Modern tier items

  Each item document contains:

  - `name` (string) - Item name
  - `description` (string) - Item description
  - `price` (number) - Base price
  - `current_bid` (number) - Current highest bid
  - `current_bidder` (string) - UID of current highest bidder
  - `current_bidder_email` (string) - Email of current highest bidder
  - `is_bidding_open` (boolean) - Whether bidding is active
  - `buyer` (string, optional) - UID of winning bidder
  - `final_price` (number, optional) - Final sale price
  - `created_at` (timestamp) - When item was created
  - `bid_end_time` (timestamp) - When bidding will close

## Indexes

### Single Field Indexes

- `users/email` Ascending
- `users/displayName` Ascending
- `items/{category}/{type}/current_bid` Ascending
- `items/{category}/{type}/created_at` Descending
- `items/{category}/{type}/is_bidding_open` Ascending
- `items/{category}/{type}/price` Ascending
- `items/{category}/{type}/buyer` Ascending
- `items/{category}/{type}/current_bidder` Ascending

### Composite Indexes

- Collection: `users`
  - Fields:
    - `email` Ascending
    - `displayName` Ascending
    - `createdAt` Descending

This composite index on users enables:

- Searching/filtering users by both email and display name
- Sorting results by creation date
- Efficient user lookup for friend connections
- Display of user information in bidding history

### Collection Group Indexes

The following collection group indexes enable querying across all item types:

- Collection Group: `budget`

  - Fields:
    - `buyer` Ascending
    - `current_bidder` Ascending
    - `final_price` Ascending
    - `created_at` Descending

- Collection Group: `luxury`

  - Fields:
    - `buyer` Ascending
    - `current_bidder` Ascending
    - `final_price` Ascending
    - `created_at` Descending

- Collection Group: `modern`
  - Fields:
    - `buyer` Ascending
    - `current_bidder` Ascending
    - `final_price` Ascending
    - `created_at` Descending

These indexes support:

- Filtering available items by price range
- Sorting items by creation date
- Querying items by buyer across all categories
- Finding active auctions with current bids
- Retrieving purchased items for the cart view

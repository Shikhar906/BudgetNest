# Firebase Setup Instructions for BudgetNest

## Firebase Console Setup

1. **Go to Firebase Console**

2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Click "Save"

3. **Enable Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (for development)
   - Choose a location (us-central1 recommended)

4. **Set up Firestore Rules** (for production):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /budgets/{budgetId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       match /expenses/{expenseId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       match /lending/{lendingId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

## What's Been Integrated

✅ **Firebase Authentication**
- Email/password login and signup
- User session management
- Automatic token refresh
- Proper error handling

✅ **Firestore Database**
- User data stored in Firestore
- Budget data synced across devices
- Expense tracking with real-time updates
- Lending/borrowing records

✅ **Data Security**
- Each user only sees their own data
- Secure authentication tokens
- Firestore security rules

## Features Now Available

1. **User Registration & Login**: Users can create accounts and sign in securely
2. **Data Persistence**: All data is saved to Firebase and syncs across sessions
3. **Real-time Updates**: Changes are immediately reflected across all devices
4. **Secure Access**: Users can only access their own financial data
5. **Offline Support**: Basic offline capabilities with Firestore

## Next Steps

1. Enable Authentication in Firebase Console (follow step 2 above)
2. Enable Firestore Database (follow step 3 above)
3. Test the application by creating a new account
4. For production, update Firestore rules (step 4 above)

Your BudgetNest app is now fully integrated with Firebase! 🎉
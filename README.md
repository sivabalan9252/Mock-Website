# Stellar Creative Agency - React Website

This project has been migrated from a static HTML/CSS/JS website to a modern React application with Firebase backend integration.

## Technology Stack

- **Frontend**: React (Functional Components & Hooks)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Backend Services**: Firebase
  - Authentication (Email/Password)
  - Firestore Database
  - Storage for media files
  - Firebase Hosting

## Project Structure

```
/
├── public/                # Static files
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   ├── firebase/          # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route views/pages
│   ├── utils/             # Helper functions
│   ├── App.js             # Main React component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── .eslintrc.js           # ESLint configuration
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Features

- **Authentication**: Login, signup, and protected routes
- **Mobile-First Design**: Responsive layout optimized for all devices
- **Intercom Integration**: Chat functionality with proper URL tracking
- **Firebase Backend**: All data is stored and retrieved from Firebase services
- **Clean URLs**: Uses React Router for clean URL paths

## Intercom Integration

The application maintains the same Intercom integration as before, but enhances it:

- Last Page URL tracking only happens on chat initiation or message sent
- URLs are formatted as `stellar/page-name` instead of raw URLs
- User identification happens on form submission, login, and signup
- Persistent chat sessions across page navigation

## Getting Started

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

3. For production build:
```
npm run build
```

4. Deploy to Firebase Hosting:
```
firebase deploy
```

## Firebase Configuration

Before running the application, you need to update the Firebase configuration in `src/firebase/config.js` with your Firebase project details.

## Additional Notes

- The primary color is set to `#e53935` (red)
- Protected routes redirect to login if user is not authenticated
- Media file uploads have size limitations to prevent Firebase storage overload
- Form submissions are validated on both client and server side

# Firebase Deployment Guide

This guide will help you deploy your application to Firebase Hosting.

## Prerequisites
- Node.js installed on your machine
- A Google account
- Firebase project already created (e.g., `zara-d0482`)

## Deployment Steps

### 1. Install Firebase CLI Globally
```bash
npm install -g firebase-tools
```

### 2. Login to Your Google Account
```bash
firebase login
```
This will open your browser to authenticate with your Google account.

### 3. Install Dependencies and Build
```bash
npm install
npm run build
```
This installs all dependencies and compiles your React/TypeScript code into the `dist` folder.

### 4. Initialize Firebase Hosting
```bash
firebase init hosting
```

When prompted, answer as follows:
- **Project**: Select "Use an existing project" and choose your Firebase project (e.g., `zara-d0482`)
- **Public directory**: Type `dist` (crucial for Vite/React apps)
- **Single-page app**: Type `y` (Yes)
- **GitHub Actions**: Type `N` (No)
- **Overwrite index.html**: Type `N` (No)

### 5. Deploy to Firebase
```bash
firebase deploy
```

## Complete Command Sequence

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to your Google account
firebase login

# Install dependencies and build
npm install
npm run build

# Initialize Firebase hosting
firebase init hosting

# Deploy
firebase deploy
```

## Verification

After deployment completes successfully, Firebase will provide you with a hosting URL. Your application will be live at that URL.

## Additional Notes

- Ensure the `dist` folder is generated before running `firebase deploy`
- If you make changes to your code, repeat steps 3 and 5 to rebuild and redeploy
- Your Firebase project must be configured with the correct project ID
- Make sure `.firebaserc` file is in your project root after initialization

## Troubleshooting

- **Build fails**: Ensure all TypeScript compiles without errors
- **Deploy fails**: Check that you're logged in with the correct Google account
- **404 errors after deployment**: Verify that `dist` is set as the public directory

import { getDocFromServer, doc } from 'firebase/firestore';
import { db } from './firebase';
import * as dbService from './db';
import * as authService from './auth';
import { BlogPost, Analytics, WebsiteSettings } from '../types';

// CRITICAL: Validate Connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_test_', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export const store = {
  // Auth
  loginWithGoogle: authService.loginWithGoogle,
  logout: authService.logout,
  subscribeToAuthChanges: authService.subscribeToAuthChanges,

  // Blogs
  getBlogs: dbService.getPosts,
  addBlog: dbService.addPost,
  updateBlog: dbService.updatePost,
  deleteBlog: dbService.deletePost,

  // Analytics
  getAnalytics: dbService.getAnalytics,
  
  // Settings
  getSettings: dbService.getSettings,
  saveSettings: dbService.updateSettings,

  // Increments
  incrementPageView: dbService.trackPageView,
  incrementPostView: dbService.trackPostView
};

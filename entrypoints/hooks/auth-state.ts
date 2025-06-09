import { useState, useEffect } from 'react';

interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    chrome.storage.local.get(['userProfile'], (result) => {
      if (result.userProfile) {
        setUserProfile(result.userProfile);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = async () => {
    try {
      // Launch Google sign-in flow
      const token = await chrome.identity.getAuthToken({ interactive: true });
      
      // Fetch user profile with the token
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${token.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      
      // Store user profile
      const userProfile = {
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      };
      
      await chrome.storage.local.set({ userProfile });
      setUserProfile(userProfile);
      setIsAuthenticated(true);
      
      return userProfile;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove cached token
      const token = await chrome.identity.getAuthToken({ interactive: false });
      if (token) {
        await chrome.identity.removeCachedAuthToken({ token: token.token! });
      }
      
      // Clear stored profile
      await chrome.storage.local.remove(['userProfile']);
      setUserProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    userProfile,
    isLoading,
    signIn,
    signOut
  };
}; 
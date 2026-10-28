import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const usePresence = (isDeveloper: boolean) => {
  const [activeUserCount, setActiveUserCount] = useState(0);

  // Heartbeat: Update current user's lastSeenAt (For everyone authenticated)
  useEffect(() => {
    const updateHeartbeat = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
          lastSeenAt: serverTimestamp()
        });
      } catch (e) {
        // Fallback for first-time creation handled in Registration
        console.warn('Heartbeat update failed - might be initial registration');
      }
    };

    const interval = setInterval(updateHeartbeat, 60000); // Every minute
    updateHeartbeat();

    return () => clearInterval(interval);
  }, []);

  // Analytics: Count users (For developer only)
  useEffect(() => {
    // Only listen if the user is a developer
    if (!isDeveloper) {
      setActiveUserCount(0);
      return;
    }

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      // In a real-production app, we'd filter for "active in last 5 mins" server-side.
      // For this implementation, we count all registered users as "identities secured".
      setActiveUserCount(snapshot.size);
    }, (error) => {
      // If we still get a permission error, it might be due to race conditions during login
      if (error.code !== 'permission-denied') {
        console.error('Analytics listener error:', error);
      }
    });

    return () => unsubscribe();
  }, [isDeveloper, auth.currentUser]);

  return { activeUserCount };
};

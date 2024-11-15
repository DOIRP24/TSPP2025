import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function useOnlineStatus(userId: string | null) {
  useEffect(() => {
    if (!userId || userId === 'admin') return;

    const userRef = doc(db, 'users', userId);

    const updateOnlineStatus = async () => {
      try {
        await setDoc(userRef, {
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    updateOnlineStatus();

    return () => {
      setDoc(userRef, {
        lastActive: serverTimestamp()
      }, { merge: true }).catch(console.error);
    };
  }, [userId]);
}
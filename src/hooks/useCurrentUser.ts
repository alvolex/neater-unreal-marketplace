import { useState, useEffect } from 'react';
import { User, getAuth } from 'firebase/auth';
import { firebaseApp } from '@/app/layout';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((curUser) => {
      if (curUser) {
        setUser(curUser);
      }
    });

    return unsubscribe;
  }, [auth]);

  return user;
}
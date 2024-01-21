"use client";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseApp } from "@/firebase";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);

  const provider = new GoogleAuthProvider();
  const auth = getAuth(firebaseApp);

  provider.addScope("email");
  provider.addScope("profile");

  const db = getFirestore(firebaseApp);

  const signIn = async () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
      })
      .catch((error) => {
        console.error({ error });
      });
  };

  //if we are logged in, console log hello
  useEffect(() => {
    auth.onAuthStateChanged((curUser) => {
      if (curUser) {
        setUser(curUser);
      }
    });
  }, [auth]);

  useEffect(() => {
    if (user) {
      setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        lastLogin: new Date(),
      });
    }
  }, [user, db]);

  //Create a subcollection inside the user document called preferences and add a random number
  const updateUserPref = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const prefRef = doc(userRef, "preferences", "randomNumber");

      await setDoc(prefRef, { value: Math.random() });
    }
  };

  const signOutFromApp = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <main>
      <h1>Login</h1>

      {user && <h2>Hello {user.displayName}</h2>}
      {!user ? (
        <button onClick={signIn}>Signup / Login with google</button>
      ) : (
        <>
          <button onClick={() => signOutFromApp()}>Sign out</button>
          <button onClick={updateUserPref}>Update user preferences</button>
        </>
      )}
    </main>
  );
}

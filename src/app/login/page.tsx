"use client";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseApp } from "@/firebase";
import Link from "next/link";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  const [bearerToken, setBearerToken] = useState<string>("");

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

      const userRef = doc(db, "users", user.uid);
      getDoc(doc(userRef, "preferences", "bearerToken")).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            setBearerToken(data.bearerToken);
            localStorage.setItem("bearerToken", data.bearerToken);
          }
        }
      });
    }
  }, [user, db]);

  //Create a subcollection inside the user document called preferences and add a random number
  const updateUserPref = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const prefRef = doc(userRef, "preferences", "bearerToken");

      localStorage.setItem("bearerToken", bearerToken);
      await setDoc(prefRef, { bearerToken });
    }
  };

  const signOutFromApp = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <main>
      {user ? <h1>Profile</h1> : <h1>Login</h1>}
      {user && <h2>Hello {user.displayName}</h2>}
      {user && <p role="button" className="profile-button"><Link href={'/'}>Back to bundles </Link></p>}
      {!user ? (
        <button onClick={signIn}>Signup / Login with google</button>
      ) : (
        <>
          <button onClick={() => signOutFromApp()}>Sign out</button>
          <div>
            <label>
              Bearer Token
              <input
                type="text"
                placeholder="Enter your bearer token"
                onChange={(e) => setBearerToken(e.target.value)}
                value={bearerToken}
              />
            </label>
            <button onClick={updateUserPref}>Update user preferences</button>
          </div>
        </>
      )}
    </main>
  );
}

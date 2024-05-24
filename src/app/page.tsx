"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MarketplaceData } from "@/types/MarketPlaceData";
import axios, { AxiosResponse } from "axios";
import { User } from "firebase/auth";
import {
  DocumentData,
  DocumentReference,
  QuerySnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromCache,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import BundleGrid from "./components/BundleGrid";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [marketplaceData, setMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  let user = useCurrentUser();

  const tryGetDataFromEpic = async (token: {
    bearerToken: string;
    XSRFToken: string;
  }) => {
    try {
      let res = await axios.get("/api/getMarketplaceData", {
        headers: { Bearer: `${token.bearerToken}`, XSRFToken: `${token.XSRFToken}` },
      });

      return res;
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data);
      }
      return null;
    }
  };

  const getDataFromApi = async (token: {
    bearerToken: string;
    XSRFToken: string;
  }) => {
    let res = await tryGetDataFromEpic(token);

    // Use cached data from firestore if we cant get data from epic.
    if (!res) {
      const db = getFirestore(firebaseApp);

      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const bundlesCollectionRef = collection(userRef, "bundles");
      const querySnapshot = await getDocs(bundlesCollectionRef);

      if (querySnapshot.docs.length > 0) {
        let allElements = await getDataFromFirestore(querySnapshot);
        setMarketplaceData(allElements);
        setLoading(false);
        return;
      }

      setLoading(false);
      alert(
        "Could not get data from epic and could not find cached data. Go to your profile and add your epic bearer token."
      );
      return;
    }

    let data: MarketplaceData = res.data;
    setMarketplaceData(data.elements);
    setLoading(false);

    if (!user) return;
    console.log("Updating cached data");
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", user.uid);
    const bundlesCollectionRef = collection(userRef, "bundles");

    // Create chunks of data to store in firestore so we dont hit the 1mb limit
    const chunkSize = 50;
    for (let i = 0; i < data.elements.length; i += chunkSize) {
      const chunk = data.elements.slice(i, i + chunkSize);
      const docRef = doc(bundlesCollectionRef, i.toString());
      await setDoc(docRef, { bundleData: chunk });
    }

    const lastUpdatedDocRef = doc(bundlesCollectionRef, "lastUpdated");
    await setDoc(lastUpdatedDocRef, {
      lastUpdated: new Date().toISOString(),
    });
  };

  const getDataFromFirestore = async (
    querySnapshot: QuerySnapshot<DocumentData, DocumentData>
  ) => {
    // Handle the chunks of data and concat them into one array
    let allElements: MarketplaceData["elements"] = [];
    querySnapshot.docs.forEach((doc) => {
      const bundleData = (doc.data() as any).bundleData;
      if (bundleData) {
        allElements = allElements.concat(bundleData);
      }
    });

    return allElements;
  };

  const handleCachedData = async (
    userRef: DocumentReference<DocumentData, DocumentData>,
    token: { bearerToken: string; XSRFToken: string}
  ) => {
    const bundlesCollectionRef = collection(userRef, "bundles");
    let querySnapshot = await getDocsFromCache(bundlesCollectionRef);

    //Check if the cached data has bundleData
    const hasBundleData = querySnapshot.docs.some(
      (doc) => doc.data().bundleData
    );

    if (!hasBundleData) {
      querySnapshot = await getDocs(bundlesCollectionRef);
    }

    if (querySnapshot.docs.length > 0) {
      let allElements = await getDataFromFirestore(querySnapshot);
      console.log("Using cached data");
      setMarketplaceData(allElements);
      setLoading(false);
    } else {
      await getDataFromApi(token);
    }
  };

  const fetchData = async (user: User, tokens: {
    bearerToken: string;
    XSRFToken: string;
  
  }) => {
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", user.uid);
    const lastUpdateRef = doc(userRef, "bundles", "lastUpdated");

    const docSnap = await getDoc(lastUpdateRef);
    if (docSnap.exists()) {
      let lastUpdated = new Date((docSnap.data() as any).lastUpdated);
      let today = new Date();
      let diff = today.getTime() - lastUpdated.getTime();
      let diffHours = diff / (1000 * 3600);

      if (diffHours < 6) {
        handleCachedData(userRef, tokens);
      } else {
        await getDataFromApi(tokens);
      }
    } else {
      await getDataFromApi(tokens);
    }
  };

  useEffect(() => {
    const bearerToken = localStorage.getItem("bearerToken");
    const XSRFToken = localStorage.getItem("XSRFToken") as string;
    if (user && bearerToken) {
      setLoading(true);
      fetchData(user, {
        bearerToken,
        XSRFToken: XSRFToken,
      });
    }
  }, [user]);

  return (
    <main>
      <h1>Bundle view</h1>
      {loading && <h1>Loading...</h1>}
      {user && <h2>Hello, {user.displayName}</h2>}
      {user ? (
        <h2 role="button" className="profile-button">
          <Link href={"/login"}> Go to profile page</Link>
        </h2>
      ) : (
        <h2>
          <Link href={"/login"}> Sign in..</Link>
        </h2>
      )}
      <BundleGrid marketplaceData={marketplaceData} />
    </main>
  );
}

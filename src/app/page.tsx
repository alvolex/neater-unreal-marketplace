"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MarketplaceData } from "@/types/MarketPlaceData";
import axios from "axios";
import { User } from "firebase/auth";
import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [marketplaceData, setMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  let user = useCurrentUser();

  const getDataFromApi = async (bearerToken: string) => {
    const res = await axios.get("/api/getMarketplaceData", {
      headers: { Authorization: `${bearerToken}` },
    });
    let data: MarketplaceData = res.data;
    setMarketplaceData(data.elements);
    setLoading(false);

    if (!user) return;
    console.log("Updating cached data");
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", user.uid);
    const bundlesCollectionRef = collection(userRef, "bundles");

    // Create chunks of data to store in firestore so we dont hit the 1mb limit
    const chunkSize = 100;
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

  const handleCachedData = async (
    userRef: DocumentReference<DocumentData, DocumentData>,
    bearerToken: string
  ) => {
    const bundlesCollectionRef = collection(userRef, "bundles");
    const querySnapshot = await getDocs(bundlesCollectionRef);

    if (querySnapshot.docs.length > 0) {
      // Handle the chunks of data and concat them into one array
      let allElements: MarketplaceData["elements"] = [];
      querySnapshot.docs.forEach((doc) => {
        const bundleData = (doc.data() as any).bundleData;
        if (bundleData) {
          allElements = allElements.concat(bundleData);
        }
      });
      setMarketplaceData(allElements);
      setLoading(false);
    } else {
      await getDataFromApi(bearerToken);
    }
  };

  const fetchData = async (user: User, bearerToken: string) => {
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", user.uid);
    const lastUpdateRef = doc(userRef, "bundles", "lastUpdated");

    const docSnap = await getDoc(lastUpdateRef);
    if (docSnap.exists()) {
      let lastUpdated = new Date((docSnap.data() as any).lastUpdated);
      let today = new Date();
      let diff = today.getTime() - lastUpdated.getTime();
      let diffHours = diff / (1000 * 3600);

      if (diffHours < 24) {
        handleCachedData(userRef, bearerToken);
      } else {
        await getDataFromApi(bearerToken);
      }
    } else {
      await getDataFromApi(bearerToken);
    }
  };

  useEffect(() => {
    const bearerToken = localStorage.getItem("bearerToken");
    if (user && bearerToken) {
      setLoading(true);
      fetchData(user, bearerToken);
    }
  }, [user]);

  return (
    <main>
      <h1>Home</h1>
      {user && <h2>Hello, {user.displayName}</h2>}
      {marketplaceData.length > 0 && (
        <div className="all-bundles">
          <h2>Marketplace Data</h2>
          <ul>
            {marketplaceData.map((item) => (
              <li key={item?.id}>
                <h1>{item?.title}</h1>
                {item?.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} />
                )}
                <div className="description">
                  <p>{item.categories && item?.categories[0].name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <h1>Loading...</h1>}
    </main>
  );
}

"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MarketplaceData } from "@/types/MarketPlaceData";
import axios from "axios";
import { User } from "firebase/auth";
import firebase from "firebase/compat/app";
import {
  collection,
  doc,
  getDoc,
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
    const bundleDataDocRef = doc(bundlesCollectionRef, "bundleData");

    await setDoc(bundleDataDocRef, {
      bundleData: data.elements,
    });

    const lastUpdatedDocRef = doc(bundlesCollectionRef, "lastUpdated");
    await setDoc(lastUpdatedDocRef, {
      lastUpdated: new Date().toISOString(),
    });
  };

  const fetchData = async (user: User, bearerToken: string) => {
    const db = getFirestore(firebaseApp);
    const userRef = doc(db, "users", user.uid);
    const lastUpdateRef = doc(userRef, "bundles", "lastUpdated");
    const bundleDataRef = doc(userRef, "bundles", "bundleData");

    const docSnap = await getDoc(lastUpdateRef);
    if (docSnap.exists()) {
      let lastUpdated = new Date((docSnap.data() as any).lastUpdated);
      let today = new Date();
      let diff = today.getTime() - lastUpdated.getTime();
      let diffHours = diff / (1000 * 3600);

      if (diffHours < 6) {
        const bundleDataSnap = await getDoc(bundleDataRef);
        if (bundleDataSnap.exists()) {
          console.log("Using cached data");
          setMarketplaceData((bundleDataSnap.data() as any).bundleData);
          setLoading(false);
        } else {
          await getDataFromApi(bearerToken);
        }
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
              <li key={item.id}>
                <h1>{item.title}</h1>
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} />
                )}
                {/* <div className="description">
                  <p>{item.description}</p>
                </div> */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

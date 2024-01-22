"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MarketplaceData } from "@/types/MarketPlaceData";
import axios from "axios";
import firebase from "firebase/compat/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [marketplaceData, setMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  let user = useCurrentUser();

  useEffect(() => {
    const bearerToken = localStorage.getItem("bearerToken");
    if (user && bearerToken) {

      //!! Todo: Check if data is older than 1 day, if so, fetch new data, otherwise use firestore data

      setLoading(true);
      axios
        .get("/api/getMarketplaceData", {
          headers: { Authorization: `${bearerToken}` },
        })
        .then((res) => {
          let data: MarketplaceData = res.data;
          setMarketplaceData(data.elements);
          setLoading(false);

          if (!user) return;
          const db = getFirestore(firebaseApp);
          const userRef = doc(db, "users", user.uid);
          const prefRef = doc(userRef, "bundles", "bundleData");

          setDoc(
            prefRef,
            {
              bundleData: data.elements,
              lastUpdated: new Date().toISOString(),
            },
            { merge: true }
          );
        });
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

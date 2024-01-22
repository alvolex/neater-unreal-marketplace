"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MarketplaceData } from "@/types/MarketPlaceData";
import axios from "axios";
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
      setLoading(true);
      axios
        .get("/api/getMarketplaceData", {
          headers: { Authorization: `${bearerToken}` },
        })
        .then((res) => {
          let data: MarketplaceData = res.data;
          setMarketplaceData(data.elements);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <main>
      <h1>Home</h1>
      {user && <h2>Hello, {user.displayName}</h2>}
      {marketplaceData.length > 0 && (
        <div>
          <h2>Marketplace Data</h2>
          <ul>
            {marketplaceData.map((item) => (
              <li key={item.id}>
                {item.title}
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

import { MarketplaceData } from "@/types/MarketPlaceData";
import UserBundleCollections from "./UserBundleCollections";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/firebase";

interface BundleGridProps {
  marketplaceData: MarketplaceData["elements"];
}

export default function BundleGrid({ marketplaceData }: BundleGridProps) {
  const [activeMarketplaceData, setActiveMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [collectionElements, setCollectionElements] = useState<string[]>([]);

  let user = useCurrentUser();
  const db = getFirestore(firebaseApp);

  const handleCollectionChange = (collectionName: string) => {
    if (collectionName.toLowerCase() === "all") {
      setActiveMarketplaceData(marketplaceData);
      return;
    }

    if (!user) return;
    let userRef = doc(db, "users", user.uid);

    async function fetchCollectionData() {
      const collectionRef = doc(
        userRef,
        "collections",
        collectionName.toLowerCase()
      );
      const collectionDoc = await getDoc(collectionRef);
      const collectionData = collectionDoc.data();

      setCollectionElements(collectionData?.bundles || []);
    }

    fetchCollectionData();
  };

  useEffect(() => {
    setActiveMarketplaceData(marketplaceData);
  }, [marketplaceData]);

  useEffect(() => {
    setActiveMarketplaceData(
      marketplaceData.filter((item) => collectionElements.includes(item.id))
    );
  }, [collectionElements]);

  return (
    <div>
      <div className="all-bundles">
        <UserBundleCollections
          handleCollectionChange={handleCollectionChange}
          draggedItem={draggedItem}
        />
        {activeMarketplaceData.length > 0 && (
          <ul>
            {activeMarketplaceData.map((item) => (
              <li
                className="bundle-item"
                key={item?.id}
                onDragStart={(e) => setDraggedItem(e.target)}
                onDragEnd={() => setDraggedItem(null)}
              >
                <h1>{item?.title}</h1>
                {item?.thumbnail && <img src={item.thumbnail} alt={item.id} />}
                <div className="description">
                  <p>{item.categories && item?.categories[0].name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

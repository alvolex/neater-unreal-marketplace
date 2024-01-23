import { MarketplaceData } from "@/types/MarketPlaceData";
import UserBundleCollections from "./UserBundleCollections";
import { useEffect, useState } from "react";

interface BundleGridProps {
  marketplaceData: MarketplaceData["elements"];
}

export default function BundleGrid({ marketplaceData }: BundleGridProps) {
  const [activeMarketplaceData, setActiveMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleCollectionChange = (collectionName: string) => {
    if (collectionName === "all") {
      setActiveMarketplaceData(marketplaceData);
    } else {
      setActiveMarketplaceData(
        marketplaceData.filter(
          (item) =>
            item.categories &&
            item.categories[0].name.toLocaleLowerCase() ===
              collectionName.toLocaleLowerCase()
        )
      );
    }
  };

  useEffect(() => {
    setActiveMarketplaceData(marketplaceData);
  }, [marketplaceData]);

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
              <li key={item?.id} onDragStart={(e) => setDraggedItem(e.target)} onDragEnd={() => setDraggedItem(null)}>
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
        )}
      </div>
    </div>
  );
}

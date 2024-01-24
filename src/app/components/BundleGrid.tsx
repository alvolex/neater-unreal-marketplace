import { MarketplaceData } from "@/types/MarketPlaceData";
import UserBundleCollections from "./UserBundleCollections";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/firebase";
import "./bundles.scss";

interface BundleGridProps {
  marketplaceData: MarketplaceData["elements"];
}

export default function BundleGrid({ marketplaceData }: BundleGridProps) {
  const [activeMarketplaceData, setActiveMarketplaceData] = useState< MarketplaceData["elements"] >([]);
  const [currentCollectionData, setCurrentCollectionData] = useState< MarketplaceData["elements"] >([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [collectionElements, setCollectionElements] = useState<string[]>([]);
  const [sortCategories, setSortCategories] = useState<string[]>([]);

  let user = useCurrentUser();
  const db = getFirestore(firebaseApp);

  const handleCollectionChange = (collectionName: string) => {
    if (collectionName.toLowerCase() === "all") {
      setActiveMarketplaceData(marketplaceData);
      setCurrentCollectionData(marketplaceData);
      setSortCategories(getUniqueCategories(marketplaceData));
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

  const sortActiveMarketplaceDataByCategory = (category: string) => {
    if (category === "all") {
      setActiveMarketplaceData(currentCollectionData);
      return;
    }

    setActiveMarketplaceData(
      currentCollectionData.filter(
        (item) => item.categories && item.categories[0].name === category
      )
    );
  };

  useEffect(() => {
    setActiveMarketplaceData(marketplaceData);
  }, [marketplaceData]);

  const getUniqueCategories = (dataSet: MarketplaceData["elements"]) => {
    let allCategories = dataSet
      .map((item) => item.categories && item.categories[0].name)
      .filter(Boolean);

    let uniqueCategories = allCategories.reduce(
      (unique: string[], item: any) => {
        return unique.includes(item) ? unique : [...unique, item];
      },
      []
    );

    return uniqueCategories;
  }

  useEffect(() => {
    let activeData = marketplaceData.filter((item) =>
      collectionElements.includes(item.id)
    );

    setActiveMarketplaceData(activeData);
    setCurrentCollectionData(activeData);
    setSortCategories(getUniqueCategories(marketplaceData));
  }, [collectionElements]);

  useEffect(() => {
    setSortCategories(getUniqueCategories(currentCollectionData));
  }, [currentCollectionData]);

  return (
    <div>
      <div>
        <div className="bundle-sort">
          SORTING
          <label>
            Categories
            <select
              title="sort"
              name="sort"
              id="sort"
              onChange={(e) =>
                sortActiveMarketplaceDataByCategory(e.target.value)
              }
            >
              <option value="all">All</option>
              {sortCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
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
                  {item?.thumbnail && (
                    <img src={item.thumbnail} alt={item.id} />
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
    </div>
  );
}

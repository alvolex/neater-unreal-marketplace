import { MarketplaceData } from "@/types/MarketPlaceData";
import UserBundleCollections from "./UserBundleCollections";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DocumentData, DocumentSnapshot, doc, getDoc, getDocFromCache, getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore";
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
  const [sortSeller, setSortSeller] = useState<string[]>([]);

  let user = useCurrentUser();
  const db = getFirestore(firebaseApp);

  const handleCollectionChange = (collectionName: string) => {
    if (collectionName.toLowerCase() === "all") {
      setActiveMarketplaceData(marketplaceData);
      setCurrentCollectionData(marketplaceData);
      setSortCategories(getUniqueCategories(marketplaceData));
      setSortSeller(getUniqueSellerNames(marketplaceData));
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

      let collectionDoc: DocumentSnapshot<DocumentData, DocumentData>;
      try {
        collectionDoc = await getDocFromCache(collectionRef);
      } catch (error) {
        collectionDoc = await getDoc(collectionRef);
      }

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

  const sortActiveMarketplaceDataBySeller = (seller: string) => {
    if (seller === "all") {
      setActiveMarketplaceData(currentCollectionData);
      return;
    }

    setActiveMarketplaceData(
      currentCollectionData.filter(
        (item) => item.seller.name === seller
      )
    );
  };

  useEffect(() => {
    setActiveMarketplaceData(marketplaceData);
    setCurrentCollectionData(marketplaceData);
    setSortCategories(getUniqueCategories(marketplaceData));
    setSortSeller(getUniqueSellerNames(marketplaceData));
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
    
    return uniqueCategories.sort((a, b) => a.localeCompare(b));
  }

  const getUniqueSellerNames = (dataSet: MarketplaceData["elements"]) => {
    let allCategories = dataSet
      .map((item) => item.seller.name)
      .filter(Boolean);

    let uniqueSellerNames = allCategories.reduce(
      (unique: string[], item: any) => {
        return unique.includes(item) ? unique : [...unique, item];
      },
      []
    );

    return uniqueSellerNames.sort((a, b) => a.localeCompare(b));
  }

  // Update active marketplace data when collection elements change
  useEffect(() => {
    let activeData = marketplaceData.filter((item) =>
      collectionElements.includes(item.id)
    );

    setActiveMarketplaceData(activeData);
    setCurrentCollectionData(activeData);
    setSortCategories(getUniqueCategories(marketplaceData));
    setSortSeller(getUniqueSellerNames(marketplaceData));
  }, [collectionElements]);

  // Update sort categories when collection data changes so the categories are always relevant
  useEffect(() => {
    setSortCategories(getUniqueCategories(currentCollectionData));
    setSortSeller(getUniqueSellerNames(currentCollectionData));
  }, [currentCollectionData]);

  return (
    <div>
      <div>
        <div className="bundle-sort">
          SORTING
          {/* Categories */}
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
          {/* Seller */}
          <label>
            Seller
            <select
              title="sortSeller"
              name="sortSeller"
              id="sortSeller"
              onChange={(e) =>
                sortActiveMarketplaceDataBySeller(e.target.value)
              }
            >
              <option value="all">All</option>
              {sortSeller.map((seller) => (
                <option key={seller} value={seller}>
                  {seller}
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
                  onClick={() => window.open("https://www.unrealengine.com/marketplace/en-US/item/" + item.catalogItemId, "_blank")}
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

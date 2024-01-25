import { MarketplaceData } from "@/types/MarketPlaceData";
import UserBundleCollections from "./UserBundleCollections";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  DocumentData,
  DocumentSnapshot,
  arrayRemove,
  doc,
  getDoc,
  getDocFromCache,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp } from "@/firebase";
import "./bundles.scss";

interface BundleGridProps {
  marketplaceData: MarketplaceData["elements"];
}

export default function BundleGrid({ marketplaceData }: BundleGridProps) {
  const [activeMarketplaceData, setActiveMarketplaceData] = useState<
    MarketplaceData["elements"]
  >([]);
  const [currentCollectionData, setCurrentCollectionData] = useState<
    MarketplaceData["elements"]
  >([]);
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [collectionElements, setCollectionElements] = useState<string[]>([]);
  const [sortCategories, setSortCategories] = useState<string[]>([]);
  const [sortSeller, setSortSeller] = useState<string[]>([]);
  const [itemToRemove, setItemToRemove] = useState<string>("");
  const removeModalRef = useRef<HTMLDivElement>(null);

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

    setActiveCollection(collectionName);
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
      currentCollectionData.filter((item) => item.seller.name === seller)
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
  };

  const getUniqueSellerNames = (dataSet: MarketplaceData["elements"]) => {
    let allCategories = dataSet.map((item) => item.seller.name).filter(Boolean);

    let uniqueSellerNames = allCategories.reduce(
      (unique: string[], item: any) => {
        return unique.includes(item) ? unique : [...unique, item];
      },
      []
    );

    return uniqueSellerNames.sort((a, b) => a.localeCompare(b));
  };

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

  const removeItemFromCollection = async (itemId: string) => {
    if (!user) return;
    let collectionRef = doc(
      db,
      "users",
      user.uid,
      "collections",
      activeCollection.toLowerCase()
    );

    await updateDoc(collectionRef, {
      bundles: arrayRemove(itemId),
    });

    removeModalRef.current?.classList.remove("active");
    setCollectionElements((prev) => prev.filter((id) => id !== itemId));
  };

  const positionModal = (e: any) => {
    var x = e.clientX;
    var y = e.clientY;
    x < 170 ? (x = 170) : (x = x);

    if (x > window.innerWidth - 130) {
      x = window.innerWidth - 130;
    }

    // @ts-ignore
    removeModalRef.current.style.left = `${x}px`;
    // @ts-ignore
    removeModalRef.current.style.top = `${y}px`;
  };

  return (
    <div>
      <div ref={removeModalRef} className="remove-modal border-anim">
        <h2>Remove asset from collection?</h2>
        <div className="button-wrapper">
          <button onClick={() => removeItemFromCollection(itemToRemove)}>
            Yes
          </button>
          <button
            onClick={() => removeModalRef.current?.classList.remove("active")}
          >
            No
          </button>
        </div>
      </div>
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
                  onClick={() =>
                    window.open(
                      "https://www.unrealengine.com/marketplace/en-US/item/" +
                        item.catalogItemId,
                      "_blank"
                    )
                  }
                  onContextMenu={async (e) => {
                    e.preventDefault();
                    setItemToRemove(item.id);
                    removeModalRef.current?.classList.add("active");
                    positionModal(e);
                  }}
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

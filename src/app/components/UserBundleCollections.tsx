"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserBundleCollectionsProps {
  handleCollectionChange: (collectionName: string) => void;
  draggedItem: any;
}

export default function UserBundleCollections({
  handleCollectionChange,
  draggedItem,
}: UserBundleCollectionsProps) {
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [highlightedElement, setHighlightedElement] = useState<number | null>(
    null
  );
  const [collections, setCollections] = useState<string[]>([]);

  const [currentlyDraggedItem, setCurrentlyDraggedItem] = useState<any>(null);
  const [lastHoveredElement, setLastHoveredElement] = useState<any>(null);

  let user = useCurrentUser();
  const db = getFirestore(firebaseApp);

  const createCollection = () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const collectionsRef = doc(
      userRef,
      "collections",
      newCollectionName.toLocaleLowerCase()
    );

    setDoc(collectionsRef, {
      bundles: arrayUnion(),
      name: newCollectionName,
    });

    setNewCollectionName("");
  };

  const updateCollectionOnDrop = () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const collectionsRef = doc(
      userRef,
      "collections",
      lastHoveredElement.innerText.toLocaleLowerCase()
    );

    updateDoc(collectionsRef, {
      bundles: arrayUnion(currentlyDraggedItem?.alt),
      name: lastHoveredElement.innerText,
    });
  };

  useEffect(() => {
    if (!draggedItem && lastHoveredElement) {
      updateCollectionOnDrop();

      setHighlightedElement(null);
      return;
    }

    setCurrentlyDraggedItem(draggedItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedItem]);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const collectionsRef = collection(userRef, "collections");

    //Get all the users collection name and store them in state
    getDocs(collectionsRef).then((querySnapshot) => {
      const collections: string[] = [];
      querySnapshot.forEach((doc) => {
        collections.push(doc.data().name);
      });
      setCollections(collections);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const changeCollection = (collectionName: string) => {
    handleCollectionChange(collectionName);
  };

  const handleDragEnter = (index: number, e: any) => {
    setHighlightedElement(index);
    setLastHoveredElement(e.target);
  };

  const handleHoverWhileDragging = (e: any) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2>Marketplace Data</h2>
      <div>
        <p>Create collection</p>
        <input
          type="text"
          placeholder="Collection name"
          onChange={(e) => setNewCollectionName(e.target.value)}
          value={newCollectionName}
        />
        <button onClick={() => createCollection()}>Create</button>
      </div>

      <div className="collection-wrapper">
        <p>My collections</p>
        <ul className="collection-grid">
          {collections &&
            collections.map((collection, index) => (
              <li
                onDragEnter={(e) => handleDragEnter(index, e)}
                onDragLeave={() => setHighlightedElement(null)}
                onDragOver={(e) => handleHoverWhileDragging(e)}
                className={highlightedElement === index ? "highlight" : ""}
                key={collection}
                onClick={() => changeCollection(collection)}
              >
                {collection}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

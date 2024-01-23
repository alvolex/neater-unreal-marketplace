"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
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
    updateDoc(userRef, {
      collections: arrayUnion(newCollectionName),
    });

    setNewCollectionName("");
  };

  useEffect(() => {
    if (!draggedItem && lastHoveredElement){
        console.log("Dropping: ", currentlyDraggedItem?.alt, " on ", lastHoveredElement.innerText)
        setHighlightedElement(null);
        return;
    };

    setCurrentlyDraggedItem(draggedItem);
  }, [draggedItem]);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    getDoc(userRef).then((doc) => {
      if (doc.exists()) {
        setCollections(doc.data()?.collections);
      }
    });
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

      <div>
        <p>My collections</p>
        <ul className="collection-grid">
          {collections.map((collection, index) => (
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

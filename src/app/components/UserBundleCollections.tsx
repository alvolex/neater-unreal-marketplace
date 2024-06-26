"use client";

import { firebaseApp } from "@/firebase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

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
  const [activeCollectionIndex, setActiveCollectionIndex] = useState<number>(1337);
  const [currentlyDraggedItem, setCurrentlyDraggedItem] = useState<any>(null);
  const [lastHoveredElement, setLastHoveredElement] = useState<any>(null);
  const [collectionToRemove, setCollectionToRemove] = useState<string>("");
  const removeModalRef = useRef<HTMLDivElement>(null);

  let user = useCurrentUser();
  const db = getFirestore(firebaseApp);

  const createCollection = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const collectionsRef = doc(
      userRef,
      "collections",
      newCollectionName.toLocaleLowerCase()
    );

    await setDoc(collectionsRef, {
      bundles: arrayUnion(),
      name: newCollectionName,
    });

    setCollections([...collections, newCollectionName]);
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

  const changeCollection = (collectionName: string, index: number) => {
    setActiveCollectionIndex(index);
    handleCollectionChange(collectionName);
  };

  const removeCollection = async (collectionName: string) => {
    if (!user || collectionName.toLocaleLowerCase() === "all") return;
    const userRef = doc(db, "users", user.uid);
    const collectionsRef = doc(
      userRef,
      "collections",
      collectionName.toLocaleLowerCase()
    );

    await deleteDoc(collectionsRef);
    removeModalRef.current?.classList.remove("active");
    setCollections(collections.filter((name) => name !== collectionName));
  };

  const handleDragEnter = (index: number, e: any) => {
    setHighlightedElement(index);
    setLastHoveredElement(e.target);
  };

  const handleHoverWhileDragging = (e: any) => {
    e.preventDefault();
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
        <h2>Are you sure you want to remove this collection?</h2>
        <div className="button-wrapper">
          <button onClick={() => removeCollection(collectionToRemove)}>
            Yes
          </button>
          <button
            onClick={() => removeModalRef.current?.classList.remove("active")}
          >
            No
          </button>
        </div>
      </div>

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
          <li onClick={()=> {changeCollection('all', 1337)}} className={activeCollectionIndex === 1337 ? "active" : ""}>
            All
          </li>
          {collections &&
            collections.map((collection, index) => (
              <li
                onDragEnter={(e) => handleDragEnter(index, e)}
                onDragLeave={() => setHighlightedElement(null)}
                onDragOver={(e) => handleHoverWhileDragging(e)}
                className={
                  (highlightedElement === index ? "highlight" : "") +
                  (activeCollectionIndex === index ? "active" : "")
                }
                key={collection}
                onClick={(e) => changeCollection(collection, index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setCollectionToRemove(collection);
                  removeModalRef.current?.classList.add("active");
                  positionModal(e);
                }}
              >
                {collection}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

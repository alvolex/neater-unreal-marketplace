import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseconfig";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
export const firebaseApp = initializeApp(firebaseConfig);

initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(),
});
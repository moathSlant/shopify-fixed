import { db } from "../firebase";
import { collection, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";

export default {
  getAccessToken: async (storeName) => {
    // Retrieve from Firestore
    const collectionRef = collection(db, 'shopifyTokens');
    const docRef = doc(collectionRef, storeName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const accessToken = docSnap.data().accessToken;
      
      // Store in session storage
      sessionStorage.setItem('shopifyAccessToken', accessToken);
      sessionStorage.setItem('shopifyStoreName', storeName);

      return accessToken;
    }
    return null;
  },
  setAccessToken: async (storeName, accessToken) => {
    // Save to Firestore
    const collectionRef = collection(db, 'shopifyTokens');
    const docRef = doc(collectionRef, storeName);
    await setDoc(docRef, { accessToken: accessToken }, { merge: true });

    // Store in session storage
    sessionStorage.setItem('shopifyAccessToken', accessToken);
    sessionStorage.setItem('shopifyStoreName', storeName);
  },
  removeAccessToken: async (storeName) => {
    // Remove from Firestore
    const collectionRef = collection(db, 'shopifyTokens');
    const docRef = doc(collectionRef, storeName);
    await updateDoc(docRef, { accessToken: deleteField() });

    // Remove from session storage
    sessionStorage.removeItem('shopifyAccessToken');
    sessionStorage.removeItem('shopifyStoreName');
  },
  getStoredAccessToken: () => {
    // Retrieve from session storage
    return sessionStorage.getItem('shopifyAccessToken');
  },
  getStoredStoreName: () => {
    // Retrieve from session storage
    return sessionStorage.getItem('shopifyStoreName');
  },
};

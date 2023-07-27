import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';

const matchService = {
  createMatching: async (fileId, fileName, fileUrl, productId, productName, price, userId, color) => {
    try {
      // Create a document in the 'matchedProducts' collection
      const matchingRef = await addDoc(collection(db, 'matchedProducts'), {
        fileId,
        fileName,
        fileUrl,
        productId,
        productName,
        matchingId: '', // Initialize the matching ID field
        price,
        userId,
        color
      });

      const matchingId = matchingRef.id;

      // Update the matching document with the generated matching ID
      const matchingDocRef = doc(db, 'matchedProducts', matchingId);
      await updateDoc(matchingDocRef, { matchingId });

      console.log('Matching created successfully:', matchingId);
      return matchingId;
    } catch (error) {
      console.error('Error creating matching:', error);
      throw new Error('Failed to create matching');
    }
  },

  getMatchedFile: async (productId) => {
    try {
      const matchedProductsQuery = query(collection(db, 'matchedProducts'), where('productId', '==', productId));
      const matchedProductsSnapshot = await getDocs(matchedProductsQuery);
      if (!matchedProductsSnapshot.empty) {
        const matchedProduct = matchedProductsSnapshot.docs[0].data();
        return matchedProduct;
      }
      return null;
    } catch (error) {
      console.error('Error getting matched file:', error);
      throw new Error('Failed to get matched file');
    }
  },
};

export default matchService;

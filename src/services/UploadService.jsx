import axios from 'axios';
import { collection, doc, addDoc, updateDoc, getDocs, getDoc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL,uploadBytesResumable  } from 'firebase/storage';
import { db, storage } from '../firebase';
const uploadService = {
  uploadFile: async (file) => {
    try {
      const fileId = `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `files/${fileId}`);
  
      // Wait for the upload to complete
      const uploadSnapshot = await uploadBytesResumable(fileRef, file);
  
      // Then get the download URL
      const fileUrl = await getDownloadURL(uploadSnapshot.ref);
      console.log(`File available at ${fileUrl}`);
  
      const filesCollectionRef = collection(db, 'files');
      const newFileRef = await addDoc(filesCollectionRef, {
        id: fileId,
        name: file.name,
        fileUrl: fileUrl,
      });
  
      // Call the uploadFileToApi function and pass the necessary parameters
      const apiResponse = await uploadFileToApi(fileUrl, file.name, '80jkdjfj9832yfjld');
  
      // Update the file document in the database with the API response data
      await updateDoc(newFileRef, {
        apiResponse: apiResponse.data, // Store the API response data
      });
  
      return newFileRef.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  
  
  uploadFileToApi: async (fileURL, filename, apiKey) => {
    try {
      // Fetch the file
      const fileResponse = await axios.get(fileURL, { responseType: 'blob' });
      const file = new Blob([fileResponse.data], { type: 'application/octet-stream' });

      // Create a form and append the file
      const formData = new FormData();
      formData.append('uploaded_file', file, filename);

      const config = {
        headers: {
          'api_key': apiKey,
        },
      };

      // Upload the file
      const uploadResponse = await axios.post(
        'https://twist3dprinting.com/api2/public/print-details ',
        formData,
        config
      );

      return uploadResponse.data;
    } catch (error) {
      // console.error('Error:', error);
      throw error;
    }
  },

  updateFile: async (fileId, data) => {
    try {
      const fileRef = doc(db, 'files', fileId);
      await updateDoc(fileRef, data);
      console.log('File updated successfully:', data);
    } catch (error) {
      console.error('Error updating file data:', error);
      throw error;
    }
  },

  getAllFiles: async (userId) => {
    try {
      const userFilesDoc = doc(db, 'files', userId);
      const userFilesDocData = await getDoc(userFilesDoc);
  
      if (userFilesDocData.exists()) {
        // Return the files array for the user
        return userFilesDocData.data().files || [];
      } else {
        // Return an empty array if no document exists for the user
        return [];
      }
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  },
}

export default uploadService;

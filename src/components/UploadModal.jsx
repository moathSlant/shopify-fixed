import React, { useState, useEffect, useRef, useContext } from 'react';
import uploadService from '../services/UploadService';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from '../firebase';  // assuming Firestrestore
import { AuthContext } from '../context/AuthContext';
const UploadModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const modalRef = useRef(null);
  const { user } = useContext(AuthContext)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      handleUpload(file);
    }
  };
  const addFileToFirestore = async (userId, fileDetails) => {
    try {
      const docRef = doc(db, "files", userId);
      await setDoc(docRef, { files: arrayUnion(fileDetails) }, { merge: true });
      console.log('File added to Firestore successfully.');
    } catch (error) {
      console.error('Error adding file to Firestore:', error);
    }
  };
  const generateUniqueId = () => {
    const now = new Date();
    const timestamp = now.getTime(); // Get the current timestamp
    const fileId = `${timestamp}`; // Combine timestamp and filename

    return fileId;
  };

  const handleUpload = async (file) => {
    try {
      if (!user) {
        console.error('User not authenticated. Please authenticate before uploading.');
        return;
      }

      const fileId = generateUniqueId(); // Generate a unique fileId here

      const storageRef = ref(storage, `3d-files/${fileId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          try {
            setIsUploading(true); // Start uploading
            const fileData = await uploadService.uploadFileToApi(
              downloadURL,
              file.name,
              import.meta.env.VITE_API_KEY2
            );
            console.log('API Response:', fileData);

            // Add file to Firestore with fileId and API response
            await addFileToFirestore(user.uid, {
              fileId, // Add the fileId to Firestore
              name: file.name,
              url: downloadURL,
              apiResponse: fileData // Store the API response data
            });

            setSelectedFile(null); // Reset the selected file
            onClose();
          } catch (error) {
            console.error('An error occurred. Please try a different file or try again.', error);
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };


  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    if (file) {
      handleUpload(file);
    }
  };

  const handleDropClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl';
    input.onchange = (event) => handleFileChange(event);
    input.click();
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`fixed z-10 inset-0 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Upload File</h2>
            {!selectedFile ? (
              <div
                className="w-full h-40 border border-gray-300 rounded mb-4 flex items-center justify-center text-gray-600 text-sm cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleDropClick}
              >
                Drag and drop a file here or click to browse
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Selected File:</h3>
                <p>{selectedFile.name}</p>
              </div>
            )}
            {selectedFile && !isUploading && (
              <div className="flex justify-center">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-2"
                  disabled={isUploading}
                  onClick={() => handleUpload(selectedFile)}
                >
                  Upload
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
                  onClick={() => setSelectedFile(null)}
                >
                  Clear
                </button>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center justify-center w-full h-12 mt-4">
                <div className="bg-blue-500 h-2 w-full rounded">
                  <div
                    className="h-full bg-white rounded"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

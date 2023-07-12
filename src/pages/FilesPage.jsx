import React, { useState, useEffect, useContext } from 'react';
import UploadModal from '../components/UploadModal';
import uploadService from '../services/UploadService';
import FileCard from '../components/FileCard';
import { FiPlus } from 'react-icons/fi';
import { doc, setDoc, arrayUnion, getDoc } from "firebase/firestore"; 
import { storage, db } from '../firebase';  
import { PropagateLoader } from 'react-spinners';
import { AuthContext } from '../context/AuthContext';
const FilesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchFiles = async () => {
    try {
      if (!user || !user.uid) {
        console.error('User not authenticated. Please authenticate before fetching files.');
        return;
      }
  
      const fetchedFiles = await uploadService.getAllFiles(user.uid);
      setFiles(fetchedFiles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (user) {  // only fetch files if user exists
      fetchFiles();
    }
  }, [user]);  // add user as dependency
  

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      await uploadService.uploadFile(file);
      setFiles([]); // Clear the files state
      setIsModalOpen(false); // Close the modal
      fetchFiles(); // Refetch the files after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      <div className={`${isModalOpen ? 'blur' : 'pt-2 px-3 row'}`}>
      {loading ? (
  <div className="text-center">
    <PropagateLoader color="#000000" size={15} />
  </div>
) : (
  files.map((file) => (
    <FileCard key={file.fileId} file={file} response={file.apiResponse} />
  ))  
)}
      </div>
      <button
        className="fixed bottom-20 right-10 bg-black text-white rounded-full p-6 shadow-lg"
        onClick={handleOpenModal}
      >
        <FiPlus className="text-xl" />
      </button>
      <UploadModal isOpen={isModalOpen} onClose={handleCloseModal} onUpload={handleUpload} />
    </div>
  );
};

export default FilesPage;

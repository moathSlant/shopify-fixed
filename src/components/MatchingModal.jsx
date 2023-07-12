import React, { useState, useEffect, useContext } from 'react';
import uploadService from '../services/UploadService';
import matchService from '../services/matchService';
import { PropagateLoader } from 'react-spinners';
import { AuthContext } from '../context/AuthContext';
const MatchingModal = ({ productId, onClose, onMatch, product }) => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fetchedFiles = await uploadService.getAllFiles(user.uid);
        const processedFiles = fetchedFiles.map((file) => ({
          ...file,
          fileId: file.fileId, // Access the nested fileId field
        }));
        setFiles(processedFiles);
        setFilteredFiles(processedFiles); // Initialize filtered files with all files
        setIsLoading(false); // Set loading status to false once files are fetched
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [user]);


  useEffect(() => {
    // Filter files based on search term
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [searchTerm, files]);
  const handleMatch = async (fileId) => {
    if (isSubmitting) {
      return; // Return early if already submitting
    }

    setIsSubmitting(true); // Set submitting status

    try {
      const selectedFile = files.find((file) => file.fileId === fileId);
      console.log(fileId);
      if (!selectedFile) {
        throw new Error('Invalid file');
      }
      console.log(fileId);
      const { name, url: fileUrl } = selectedFile;
      await matchService.createMatching(fileId, name, fileUrl, productId, product.title);
      onMatch(fileId, productId);
      onClose();
    } catch (error) {
      console.error('Error matching file:', error);
    } finally {
      setIsSubmitting(false); // Reset submitting status
    }
  };


  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md backdrop-filter backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4">Select a File to Match</h2>
          <div className="mb-4">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Search files"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <PropagateLoader color="#4a4a4a" />
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-4 max-h-96 overflow-y-auto`}>
              {filteredFiles.length === 0 ? (
                <p className="text-center text-gray-500">No files found</p>
              ) : (
                <>
                  {filteredFiles.slice().map((file) => (
                    <div key={file.id} className="border border-gray-300 rounded p-4 cursor-pointer">
                      <p>{file.name}</p>
                      <button
                        className="bg-black hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded mt-2"
                        onClick={() => handleMatch(file.fileId)} // Use file.fileId instead of file.id
                      >
                        Match
                      </button>

                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded mt-4"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingModal;

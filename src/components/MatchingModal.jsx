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
  const [selectedColors, setSelectedColors] = useState({});

  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fetchedFiles = await uploadService.getAllFiles(user.uid);
        const processedFiles = fetchedFiles.map((file) => {
          // Assume the `apiResponse` object is at the root level of each file
          const { materialUsageInGrams, timeToPrintInSeconds } = file.apiResponse;
          return {
            ...file,
            fileId: file.fileId, // Access the nested fileId field
            materialUsageInGrams,
            timeToPrintInSeconds,
          };
        });
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
      if (!selectedFile) {
        throw new Error('Invalid file');
      }
  
      const selectedColor = selectedColors[fileId];
      if (!selectedColor) {
        throw new Error('Color must be selected');
      }
  
      const { name, url: fileUrl, timeToPrintInSeconds } = selectedFile;
      let printTimeInHours;
      let price;
      if (timeToPrintInSeconds) {
        printTimeInHours = timeToPrintInSeconds / 3600;
        price = printTimeInHours; // $1 per hour
      }
  
      await matchService.createMatching(fileId, name, fileUrl, productId, product.title, price.toFixed(2), user.uid, selectedColor);
      onMatch(fileId, productId, selectedColor);
      onClose();
    } catch (error) {
      console.error('Error matching file:', error);
    } finally {
      setIsSubmitting(false); // Reset submitting status
    }
  };
  
  const handleColorSelect = (color, fileId) => {
    setSelectedColors({ ...selectedColors, [fileId]: color });
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
                {filteredFiles.map((file) => (
  <div key={file.fileId} className="border border-gray-300 rounded p-4 cursor-pointer flex items-center justify-between">
    <div>
      <p>{file.name}</p>
    </div>
    <div className="flex items-center">
      <div className="mb-4 flex space-x-2 pt-5">
        <div
          className={`h-6 w-6 border-2 ${selectedColors[file.fileId] === 'black' ? 'border-blue-500' : 'border-blue'} rounded`}
          style={{ backgroundColor: 'black' }}
          onClick={() => handleColorSelect('black', file.fileId)}
        />
        <div
          className={`h-6 w-6 border-2 ${selectedColors[file.fileId] === 'white' ? 'border-blue-500' : 'border-blue'} rounded`}
          style={{ backgroundColor: 'white' }}
          onClick={() => handleColorSelect('white', file.fileId)}
        />
        <div
          className={`h-6 w-6 border-2 ${selectedColors[file.fileId] === 'gray' ? 'border-blue-500' : 'border-blue'} rounded`}
          style={{ backgroundColor: 'gray' }}
          onClick={() => handleColorSelect('gray', file.fileId)}
        />
      </div>
      <button
        className="bg-black text-white font-semibold py-2 px-4 rounded mt-2 ml-4"
        onClick={() => handleMatch(file.fileId)} // Use file.fileId instead of file.id
      >
        Match
      </button>
    </div>
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

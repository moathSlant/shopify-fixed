import React, { useState, useEffect } from 'react';
import MatchingModal from './MatchingModal';
import matchService from '../services/matchService';

const ProductCard = ({ product }) => {
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [matchedFileName, setMatchedFileName] = useState('');

  useEffect(() => {
    const checkMatchedFile = async () => {
      try {
        const matchedFile = await matchService.getMatchedFile(product.id);
        if (matchedFile) {
          setMatchedFileName(matchedFile.fileName);
        }
      } catch (error) {
        console.error('Error checking matched file:', error);
      }
    };

    checkMatchedFile();
  }, [product.id]);

  const handleMatchButtonClick = () => {
    console.log('Selected Product ID:', product.id);
    setIsMatchingModalOpen(true);
  };

  const handleMatchingModalClose = () => {
    setIsMatchingModalOpen(false);
  };

  const handleMatchingModalMatch = (fileId) => {
    // Perform the matching logic here
    console.log('Matched Product ID:', product.id);
    console.log('Matched File ID:', fileId);
  };

  return (
    <>
      {isMatchingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
          <MatchingModal
            productId={product.id}
            onClose={handleMatchingModalClose}
            onMatch={handleMatchingModalMatch}
            product={product}
          />
        </div>
      )}
      <div className={`relative flex h-40 p-4 mb-4 border border-gray-300 rounded shadow-md transition duration-300 ease-in-out ${isMatchingModalOpen ? 'darken' : ''}`}>
        <img className="w-32 h-32 mr-4 object-cover" src={product.images[0]?.src || ''} alt={product.title} />
        <div className="flex flex-col justify-between flex-grow">
          <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
          <p className="text-gray-700">Price: ${product.variants[0]?.price || ''}</p>
          <p className="text-gray-700">SKU: {product.id}</p>
        </div>
        {matchedFileName ? (
          <p>Matched with: {matchedFileName}</p>
        ) : (
          <button onClick={handleMatchButtonClick}>Match</button>
        )}
      </div>
    </>
  );
};

export default ProductCard;

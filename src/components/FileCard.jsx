import React, { useState } from 'react';
import { PropagateLoader } from 'react-spinners';

const FileCard = ({ file, response }) => {
  return (
    <div className="border border-gray-300 rounded shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">{file.name}</h2>
      {response ? (
        <p className="m-auto text-center">{JSON.stringify(response)}</p>
      ) : (
        <p className="m-auto text-center">Processing</p>
      )}
      <div className="flex justify-center mt-4">
        <PropagateLoader color="#000000" size={10} />
      </div>
    </div>
  );
};

export default FileCard;

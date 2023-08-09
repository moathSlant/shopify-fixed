import React, { useState } from 'react';
import { PropagateLoader } from 'react-spinners';

const FileCard = ({ file, response }) => {

    // Calculate the print time in hours and price
    let printTimeInHours;
    let price;
    if (response && response.timeToPrintInSeconds) {
        printTimeInHours = response.timeToPrintInSeconds / 3600 + 1.50;
        price = printTimeInHours; // $1 per hour
    }

    return (

    // Calculate the print time in hours and price
    let printTimeInHours;
    let price;
    if (response && response.timeToPrintInSeconds) {
        printTimeInHours = response.timeToPrintInSeconds / 3600;
        price = printTimeInHours; // $1 per hour
    }

    return (
    <div className="border border-gray-300 rounded shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">{file.name}</h2>
        {response ? (
            <>
                {/* <p className="m-auto text-center">Estimated Print Time: {printTimeInHours.toFixed(2)} hours</p> */}
                <p className="m-auto text-center"> Cost to print: ${price.toFixed(2)}</p>
            </>
        ) : (
            <div className="m-auto text-center">
                <p>Processing</p>
                <PropagateLoader color="#000000" size={10} />
            </div>
        )}
    </div>
    );
};

export default FileCard;

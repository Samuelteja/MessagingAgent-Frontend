// In frontend/src/pages/gas/BookingImportPage.jsx

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDeliveryList } from '../../services/api';
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

function BookingImportPage() {
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Clear previous results when a new file is selected
      setUploadResult(null);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !deliveryDate) {
      setError("Please select a date and a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('delivery_date', deliveryDate);
    formData.append('file', file);

    try {
      const res = await uploadDeliveryList(formData);
      setUploadResult(res.data);
      setFile(null); // Clear the file input on success
    } catch (err) {
      console.error("Failed to upload delivery list:", err);
      let errorMessage = "An unexpected error occurred during the upload.";
      
      if (err.response?.data?.detail) {
          const errorDetail = err.response.data.detail;
          
          // Case 1: FastAPI validation error (an array of objects)
          if (Array.isArray(errorDetail) && errorDetail[0]?.msg) {
              // Extract the message from the first validation error.
              // Example msg: "Input should be a valid string"
              errorMessage = `Validation Failed: ${errorDetail[0].msg}`;
          } 
          // Case 2: Custom error message (a simple string)
          else if (typeof errorDetail === 'string') {
              errorMessage = errorDetail;
          }
      }

      setError(errorMessage);
    }
    setIsUploading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Delivery Operations</h1>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-bold text-gray-700">1. Upload Today's Delivery List</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <input
                  type="date"
                  id="delivery_date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center text-center transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
              <input {...getInputProps()} />
              <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">{file ? `Selected: ${file.name}` : 'Drag & drop or click to select a file'}</p>
              <p className="text-xs text-gray-500 mt-1">.csv or .xlsx</p>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full flex justify-center items-center px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isUploading ? 'Uploading & Processing...' : 'Upload & Start Broadcast'}
            </button>
          </div>
        </form>

        {/* Feedback Section */}
        <div className="mt-6">
            {error && (
                <div className="p-4 bg-red-100 border-l-4 border-red-400 text-red-700 rounded-md flex items-start">
                    <FiAlertTriangle className="h-6 w-6 mr-3"/>
                    <div>
                        <strong className="font-bold">Upload Failed:</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            {uploadResult && (
                <div className="p-4 bg-green-100 border-l-4 border-green-400 text-green-700 rounded-md flex items-start">
                    <FiCheckCircle className="h-6 w-6 mr-3"/>
                    <div>
                        <strong className="font-bold">{uploadResult.message}</strong>
                        <ul className="list-disc list-inside mt-1 text-sm">
                            <li>Deliveries Parsed: {uploadResult.summary.total_parsed}</li>
                            <li>New Customers Created: {uploadResult.summary.new_customers_created}</li>
                            <li>Confirmations Scheduled: {uploadResult.summary.confirmations_scheduled}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default BookingImportPage;
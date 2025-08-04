import React, { useState, useRef } from 'react';
import { Upload, Check, X, FileSpreadsheet, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (success: boolean) => void;
}

// Interface for the successful upload response from the backend
interface UploadResponse {
  message: string;
  emailCount: number;
  emailsSample: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadError('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
      return;
    }
    setFile(selectedFile);
    setUploadError(null);
    // Automatically trigger upload once a file is selected
    handleUpload(selectedFile);
  };

  const handleUpload = async (fileToUpload: File) => {
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadResult(null);
    setUploadError(null);
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    const loadingToast = toast.loading('Uploading and processing file...');

    try {
      const response = await axios.post<UploadResponse>('https://bulky-9eky.onrender.com/api/upload', formData);
      
      setUploadResult(response.data);
      onUpload(true); // Notify parent component of success
      toast.success(`Success! Found ${response.data.emailCount} emails.`);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorData = error.response?.data;
      // Use the specific error from the backend if available
      const errorMessage = errorData?.error || 'Failed to upload or process the file.';
      setUploadError(errorMessage);
      onUpload(false); // Notify parent component of failure
      toast.error(errorMessage);
      setFile(null); // Clear the invalid file
    } finally {
      setIsUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setUploadError(null);
    onUpload(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload an Excel file (.xlsx, .xls). The app will automatically find and extract all valid email addresses from the sheet.
      </p>
      
      {/* If upload is successful, show the result card */}
      {uploadResult ? (
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 text-center">
          <Check className="mx-auto h-12 w-12 text-green-600" />
          <h3 className="mt-2 text-lg font-semibold text-green-800">
            File Processed Successfully
          </h3>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {uploadResult.emailCount} Emails Found
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Sample: {uploadResult.emailsSample.join(', ')}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw size={16} className="mr-2" />
            Upload Another File
          </button>
        </div>
      ) : (
        // Otherwise, show the uploader
        <div 
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${uploadError ? 'border-red-400 bg-red-50' : ''}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          {isUploading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 font-medium text-gray-700">Processing your file...</p>
              <p className="text-sm text-gray-500">Extracting email addresses.</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <label htmlFor="file-upload" className="relative cursor-pointer">
                <p className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  Click to upload or drag and drop
                </p>
                <input
                  ref={inputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Excel (.xlsx, .xls) files only</p>
            </>
          )}
        </div>
      )}
      
      {uploadError && !uploadResult && (
        <p className="text-sm text-red-600 mt-2 flex items-center justify-center">
          <X size={16} className="mr-1" />
          {uploadError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
import React, { useState, useRef } from 'react';
import { Upload, Check, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (success: boolean) => void;
}

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
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadError('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
      return;
    }
    setFile(selectedFile);
    setUploadError(null);
    handleUpload(selectedFile);
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const loadingToast = toast.loading('Uploading and processing file...');

    try {
      const response = await axios.post<UploadResponse>('https://bulky-9eky.onrender.com/api/upload', formData);
      setUploadResult(response.data);
      onUpload(true);
      toast.success(`Success! Found ${response.data.emailCount} emails.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to upload or process the file.';
      setUploadError(errorMessage);
      onUpload(false);
      toast.error(errorMessage);
      setFile(null);
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
    if (inputRef.current) inputRef.current.value = "";
  };

  if (uploadResult) {
    return (
      <div className="text-center p-6 bg-green-50 border-2 border-green-300 rounded-lg">
        <Check className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-2 text-lg font-semibold text-green-800">File Processed Successfully</h3>
        <p className="mt-1 text-3xl font-bold text-green-900">{uploadResult.emailCount} Emails Found</p>
        <p className="text-xs text-gray-500 mt-2 truncate">Sample: {uploadResult.emailsSample.join(', ')}</p>
        <button type="button" onClick={handleReset} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw size={16} className="mr-2" />
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Upload an Excel file (.xlsx, .xls). We'll automatically find and extract all valid email addresses.</p>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} ${uploadError ? 'border-red-400 bg-red-50' : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        {isUploading ? (
          <div>
            <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
            <p className="mt-4 font-semibold text-gray-700">Processing your file...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <label htmlFor="file-upload" className="relative cursor-pointer mt-2 block">
              <span className="text-base font-semibold text-indigo-600 hover:text-indigo-700">Click to upload</span>
              <span className="text-gray-500"> or drag and drop</span>
              <input ref={inputRef} id="file-upload" type="file" className="sr-only" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isUploading} />
            </label>
            <p className="text-xs text-gray-500 mt-1">Excel (.xlsx, .xls) files only</p>
          </>
        )}
      </div>
      {uploadError && <p className="text-sm text-red-600 text-center">{uploadError}</p>}
    </div>
  );
};

export default FileUpload;
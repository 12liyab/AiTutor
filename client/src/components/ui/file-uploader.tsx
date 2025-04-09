import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  isLoading?: boolean;
}

const FileUploader = ({
  onFileSelect,
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSize = 10 * 1024 * 1024, // 10MB default
  isLoading = false
}: FileUploaderProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds the maximum limit of ${Math.round(maxSize / (1024 * 1024))}MB`);
      return false;
    }
    
    // Check file type
    const fileType = file.type.toLowerCase();
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      setError('Invalid file type. Only PDF, PNG, and JPG files are allowed.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <div 
        className={`file-drop-area flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer hover:bg-gray-50 ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'
        } ${error ? 'border-red-400 bg-red-50' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-primary hover:text-primary/80">Click to upload</span> or drag and drop
          </p>
          <p className="mt-2 text-xs text-gray-500">
            PDF or image files (PNG, JPG, JPEG)
          </p>
          {selectedFile && (
            <div className="mt-4 py-2 px-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-gray-700">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button
          disabled={!selectedFile || isLoading}
          onClick={() => selectedFile && onFileSelect(selectedFile)}
          className="inline-flex items-center px-6 py-5 text-base"
        >
          {isLoading ? (
            <>
              <span className="mr-2">Processing...</span>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Process Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;

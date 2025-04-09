import { FileText, Image, Trash2 } from "lucide-react";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
  onGenerate: (documentId: number) => void;
  onDelete: (documentId: number) => void;
}

const DocumentCard = ({ document, onGenerate, onDelete }: DocumentCardProps) => {
  // Format the file size to a readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentIcon = () => {
    const fileType = document.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return (
        <div className="bg-red-50 p-4 rounded-full">
          <FileText className="h-10 w-10 text-red-500" />
        </div>
      );
    } else if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png') || fileType.includes('jpeg')) {
      return (
        <div className="bg-blue-50 p-4 rounded-full">
          <Image className="h-10 w-10 text-blue-500" />
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 p-4 rounded-full">
          <FileText className="h-10 w-10 text-gray-500" />
        </div>
      );
    }
  };

  const uploadDate = document.uploadDate instanceof Date 
    ? document.uploadDate 
    : new Date(document.uploadDate);

  const timeAgo = formatDistanceToNow(uploadDate, { addSuffix: true });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/30 group">
      <div className="h-40 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        {getDocumentIcon()}
      </div>
      <div className="p-5">
        <h3 className="text-base font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
          {document.name}
        </h3>
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-md">
            {formatFileSize(document.fileSize)}
          </span>
          <span className="mx-2">•</span>
          <span>
            {timeAgo}
          </span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(document.id);
            }}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span>Delete</span>
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onGenerate(document.id)}
            className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Generate Questions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

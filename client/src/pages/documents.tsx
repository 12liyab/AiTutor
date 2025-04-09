import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/App";
import { Document } from "@shared/schema";
import DocumentCard from "@/components/document-card";
import LoadingOverlay from "@/components/loading-overlay";
import { FileText } from "lucide-react";
import { useLocation } from "wouter";

interface DocumentsProps {
  user: User | null;
}

const Documents = ({ user }: DocumentsProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch documents if user is logged in
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/documents/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!user,
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', user?.id] });
      toast({
        title: 'Document deleted',
        description: 'Document has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the document',
        variant: 'destructive',
      });
    },
  });

  // Generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ documentId, count }: { documentId: number, count: number }) => {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, count }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate questions');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions', variables.documentId] });
      toast({
        title: 'Questions generated',
        description: `${data.length} questions have been generated successfully`,
      });
      navigate('/questions');
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An error occurred while generating questions',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateQuestions = async (documentId: number) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to generate questions',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await generateQuestionsMutation.mutateAsync({ documentId, count: 5 });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this document? All associated questions will also be deleted.')) {
      await deleteDocumentMutation.mutateAsync(documentId);
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Documents
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your uploaded documents
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-500 mb-6">
            Sign in to view your documents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your uploaded documents
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-6">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-6">
                Upload a document from the dashboard to get started
              </p>
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-medium text-primary hover:text-indigo-700"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onGenerate={handleGenerateQuestions}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Loading Overlay */}
      <LoadingOverlay
        isLoading={isGenerating}
        message="Generating Questions"
        subMessage="AI is creating personalized questions based on your document..."
      />
    </div>
  );
};

export default Documents;

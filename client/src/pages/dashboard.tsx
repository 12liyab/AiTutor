import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUploader from "@/components/ui/file-uploader";
import DocumentCard from "@/components/document-card";
import QuestionCard from "@/components/question-card";
import LoadingOverlay from "@/components/loading-overlay";
import { User } from "@/App";
import { Document, Question } from "@shared/schema";
import { LayoutDashboard } from "lucide-react";
import { useLocation } from "wouter";

interface DashboardProps {
  user: User | null;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);

  // Fetch documents if user is logged in
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/documents/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch questions for active document
  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ['/api/questions', activeDocumentId],
    queryFn: async () => {
      if (!activeDocumentId) return [];
      const response = await fetch(`/api/questions/${activeDocumentId}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!activeDocumentId,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', user?.id] });
      toast({
        title: 'Upload successful',
        description: 'Document has been uploaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred while uploading the document',
        variant: 'destructive',
      });
    },
  });

  // Generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ documentId, count }: { documentId: number, count: number }) => {
      const response = await apiRequest('POST', '/api/questions/generate', { documentId, count });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions', variables.documentId] });
      setActiveDocumentId(variables.documentId);
      toast({
        title: 'Questions generated',
        description: `${data.length} questions have been generated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An error occurred while generating questions',
        variant: 'destructive',
      });
    },
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
      if (activeDocumentId) {
        queryClient.invalidateQueries({ queryKey: ['/api/questions', activeDocumentId] });
      }
      setActiveDocumentId(null);
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

  const handleFileSelect = async (file: File) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload documents',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id.toString());
      
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

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
    setActiveDocumentId(documentId);
    
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

  const getActiveDocumentName = () => {
    if (!activeDocumentId) return null;
    const document = documents.find(doc => doc.id === activeDocumentId);
    return document?.name || null;
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="section-title gradient-heading text-3xl sm:text-4xl">
              Welcome to Ai Tutor
            </h2>
            <p className="mt-2 text-gray-600">
              Your interactive learning assistant
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Please sign in</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Sign in to unlock all features: upload documents, generate interactive questions, and track your learning progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="section-title gradient-heading text-3xl sm:text-4xl">
            Welcome, {user.username}
          </h2>
          <p className="mt-2 text-gray-600">
            Upload documents and generate interactive study questions
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        {/* File Upload Section */}
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-6">
            Upload PDF documents or images to extract text and generate AI-powered questions.
          </p>
          
          <div className="mt-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              isLoading={isUploading}
            />
          </div>
        </div>
        
        {/* Recent Documents Section */}
        {documents.length > 0 && (
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h3>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {documents.slice(0, 6).map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onGenerate={handleGenerateQuestions}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
            
            {documents.length > 6 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => navigate('/documents')}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View all documents →
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Generated Questions Section */}
        {questions.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Questions
              {getActiveDocumentName() && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  from "{getActiveDocumentName()}"
                </span>
              )}
            </h3>
            
            <div className="space-y-5">
              {questions.slice(0, 3).map((question) => (
                <QuestionCard 
                  key={question.id} 
                  question={question}
                  documentName={getActiveDocumentName() || undefined}
                />
              ))}
            </div>
            
            {questions.length > 3 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => navigate('/questions')}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View all questions →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Loading Overlays */}
      <LoadingOverlay
        isLoading={isUploading}
        message="Processing Document"
        subMessage="Extracting text content..."
      />
      
      <LoadingOverlay
        isLoading={isGenerating}
        message="Generating Questions"
        subMessage="AI is creating personalized questions based on your document..."
      />
    </div>
  );
};

export default Dashboard;

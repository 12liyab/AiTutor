import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/App";
import { Document, Question } from "@shared/schema";
import QuestionCard from "@/components/question-card";
import { ClipboardList, FileText } from "lucide-react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/loading-overlay";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface QuestionsProps {
  user: User | null;
}

const ITEMS_PER_PAGE = 5;

const Questions = ({ user }: QuestionsProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentMap, setDocumentMap] = useState<Record<number, string>>({});

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

  // Fetch questions for selected document
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedDocumentId ? parseInt(selectedDocumentId) : null],
    queryFn: async () => {
      if (!selectedDocumentId) return [];
      const response = await fetch(`/api/questions/${selectedDocumentId}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!selectedDocumentId,
  });

  // Build document map for showing document names in question cards
  useEffect(() => {
    if (documents.length > 0) {
      const map: Record<number, string> = {};
      documents.forEach(doc => {
        map[doc.id] = doc.name;
      });
      setDocumentMap(map);
      
      // Auto-select first document if none selected
      if (!selectedDocumentId && documents.length > 0) {
        setSelectedDocumentId(documents[0].id.toString());
      }
    }
  }, [documents, selectedDocumentId]);

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
      setCurrentPage(1);
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An error occurred while generating questions',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateQuestions = async () => {
    if (!user || !selectedDocumentId) {
      toast({
        title: 'Error',
        description: 'Please select a document first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await generateQuestionsMutation.mutateAsync({ 
        documentId: parseInt(selectedDocumentId), 
        count: parseInt(questionCount) 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Generated Questions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and study AI-generated questions
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-500 mb-6">
            Sign in to view your generated questions
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
            Generated Questions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and study AI-generated questions
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Document Selection & Question Generation */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gray-50 p-5 rounded-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Document</label>
                <Select 
                  value={selectedDocumentId}
                  onValueChange={setSelectedDocumentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.length === 0 ? (
                      <SelectItem value="" disabled>No documents available</SelectItem>
                    ) : (
                      documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          {doc.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                <Select 
                  value={questionCount}
                  onValueChange={setQuestionCount}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button
                className="w-full"
                onClick={handleGenerateQuestions}
                disabled={!selectedDocumentId || isGenerating}
              >
                Generate New Questions
              </Button>
            </div>
          </div>
        </div>
        
        {/* Question List */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-500">Loading questions...</p>
            </div>
          ) : paginatedQuestions.length === 0 ? (
            <div className="py-10 text-center">
              <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-6">
                {selectedDocumentId 
                  ? "Generate questions for this document using the form above" 
                  : "Select a document to generate questions"
                }
              </p>
              {!selectedDocumentId && documents.length === 0 && (
                <button 
                  onClick={() => navigate('/')}
                  className="text-sm font-medium text-primary hover:text-indigo-700"
                >
                  Upload a document first
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedQuestions.map((question) => (
                <QuestionCard 
                  key={question.id} 
                  question={question}
                  documentName={documentMap[question.documentId]}
                />
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 3 + i;
                        }
                        if (pageNum > totalPages) {
                          pageNum = totalPages - (4 - i);
                        }
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
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

export default Questions;

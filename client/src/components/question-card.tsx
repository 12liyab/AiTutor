import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  documentName?: string;
}

const QuestionCard = ({ question, documentName }: QuestionCardProps) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const toggleAnswer = () => {
    setIsAnswerVisible(!isAnswerVisible);
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
      isAnswerVisible 
        ? 'border-primary/30 shadow-md' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div 
        className={`p-5 cursor-pointer ${isAnswerVisible ? 'bg-primary/5 border-b border-primary/20' : ''}`}
        onClick={toggleAnswer}
      >
        <div className="flex justify-between items-start">
          <h4 className={`text-base font-medium ${isAnswerVisible ? 'text-primary' : 'text-gray-900 group-hover:text-gray-700'}`}>
            {question.question}
          </h4>
          <button 
            className={`ml-3 flex-shrink-0 rounded-full p-1 ${
              isAnswerVisible 
                ? 'bg-primary/10 text-primary' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleAnswer();
            }}
          >
            {isAnswerVisible ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        {documentName && (
          <div className="mt-2 flex items-center">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
              {documentName}
            </span>
          </div>
        )}
      </div>
      
      {isAnswerVisible && (
        <div className="p-5 bg-white border-t border-gray-100">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Answer:</h5>
          <div 
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: question.answer.replace(/\n/g, '<br />') 
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default QuestionCard;

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { QuizSummary } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface DashboardQuizzesOverviewCardProps {
  quizzes: QuizSummary[];
  isLoading: boolean;
  error: string | null;
}

export const DashboardQuizzesOverviewCard: React.FC<DashboardQuizzesOverviewCardProps> = ({
  quizzes,
  isLoading,
  error
}) => {
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const DISPLAY_LIMIT = 3;

  const toggleQuiz = (quizId: string) => {
    const newExpanded = new Set(expandedQuizzes);
    if (newExpanded.has(quizId)) {
      newExpanded.delete(quizId);
    } else {
      newExpanded.add(quizId);
    }
    setExpandedQuizzes(newExpanded);
  };

  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, DISPLAY_LIMIT);

  return (
    <Card className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardHeader>
        <CardTitle className={`${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark} font-serif`}>
          Quizzes Overview
        </CardTitle>
        <CardDescription className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>
          Recent quiz submissions and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataDisplayWrapper isLoading={isLoading} error={error}>
          <div className="space-y-4">
            {displayedQuizzes.map((quiz) => {
              const submissionRate = quiz.totalEligible > 0 
                ? Math.round((quiz.submittedCount / quiz.totalEligible) * 100) 
                : 0;
              const isExpanded = expandedQuizzes.has(quiz.id);

              return (
                <div key={quiz.id} className="flex flex-col space-y-2 p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>
                        {quiz.title}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuiz(quiz.id)}
                      className="p-1"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>
                          {quiz.submittedCount} / {quiz.totalEligible} submitted
                        </span>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          submissionRate >= 80 ? AdminStyles.positiveBg + ' ' + AdminStyles.positiveColor :
                          submissionRate >= 50 ? AdminStyles.warningBg + ' ' + AdminStyles.warningColor :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {submissionRate}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {quizzes.length > DISPLAY_LIMIT && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? "Show Less" : `Show All (${quizzes.length})`}
              </Button>
            )}
          </div>
        </DataDisplayWrapper>
      </CardContent>
    </Card>
  );
};
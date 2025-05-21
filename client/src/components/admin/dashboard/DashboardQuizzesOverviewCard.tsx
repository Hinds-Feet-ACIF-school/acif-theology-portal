import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Clock, ArrowUpRight } from "lucide-react";
import { QuizSummary } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface DashboardQuizzesOverviewCardProps {
  quizzes: QuizSummary[];
  isLoading: boolean;
  error: string | null;
  onManageQuizzes: () => void;
}

export const DashboardQuizzesOverviewCard: React.FC<DashboardQuizzesOverviewCardProps> = ({ quizzes, isLoading, error, onManageQuizzes }) => {
  return (
    <Card className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardHeader>
        <CardTitle className={`${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark} font-serif`}>Quizzes Overview</CardTitle>
        <CardDescription className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>Recent and upcoming quiz status</CardDescription>
      </CardHeader>
      <CardContent>
        <DataDisplayWrapper isLoading={isLoading} error={error} count={quizzes.length} loadingText="Loading quizzes overview..." noDataMessage="No quizzes to display.">
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                <div>
                  <p className={`text-sm font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{quiz.title}</p>
                  <p className={`text-xs ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>{quiz.courseName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>{quiz.submittedCount}/{quiz.totalEligible} Submitted</span>
                  <div className={`flex items-center gap-2 text-xs flex-shrink-0 ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataDisplayWrapper>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className={`w-full ${AdminStyles.outlineButtonClasses}`} onClick={onManageQuizzes}>
          Manage Quizzes <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
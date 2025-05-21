import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Eye, Edit } from "lucide-react";
import { Quiz } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface QuizzesTableProps {
  quizzes: Quiz[];
  isLoading: boolean;
  error: string | null;
}

export const QuizzesTable: React.FC<QuizzesTableProps> = ({ quizzes, isLoading, error }) => {
  return (
    <Card className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardContent className="p-0">
        <DataDisplayWrapper isLoading={isLoading} error={error} count={quizzes.length} loadingText="Loading quizzes..." noDataMessage="No quizzes found matching your criteria.">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className={`${AdminStyles.tableHeaderBgLight} ${AdminStyles.tableHeaderBgDark}`}>
                <tr>
                  <th className={AdminStyles.tableHeaderClasses}>Quiz Title</th>
                  <th className={AdminStyles.tableHeaderClasses}>Course</th>
                  <th className={AdminStyles.tableHeaderClasses}>Due Date</th>
                  <th className={AdminStyles.tableHeaderClasses}>Submissions</th>
                  <th className={`${AdminStyles.tableHeaderClasses} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${AdminStyles.tableBorderLight} ${AdminStyles.tableBorderDark}`}>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className={`${AdminStyles.tableRowBgLight} ${AdminStyles.tableRowBgDark}`}>
                    <td className={`p-4 align-middle font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{quiz.title}</td>
                    <td className={AdminStyles.tableCellClasses}>{quiz.courseName}</td>
                    <td className={AdminStyles.tableCellClasses}>{quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className={AdminStyles.tableCellClasses}>
                      {quiz.submittedCount}/{quiz.totalEligible}
                    </td>
                    <td className={`${AdminStyles.tableCellClasses} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/quizzes/${quiz.id}/submissions`}>
                          <Button variant="ghost" size="icon" className={`${AdminStyles.ghostButtonClasses} h-8 w-8`}>
                            <span className="sr-only">View Submissions</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                          <Button variant="ghost" size="icon" className={`${AdminStyles.ghostButtonClasses} h-8 w-8`}>
                            <span className="sr-only">Edit Quiz</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataDisplayWrapper>
      </CardContent>
    </Card>
  );
};
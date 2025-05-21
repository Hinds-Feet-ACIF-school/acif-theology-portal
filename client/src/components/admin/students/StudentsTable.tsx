import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Eye, Edit } from "lucide-react";
import { Student } from "../../../types/admin";
import { getStatusBadgeClasses } from "../../../utils/adminUtils";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  error: string | null;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({ students, isLoading, error }) => {
  const navigate = useNavigate();

  return (
    <Card className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardContent className="p-0">
        <DataDisplayWrapper isLoading={isLoading} error={error} count={students.length} loadingText="Loading students..." noDataMessage="No students found matching your criteria.">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className={`${AdminStyles.tableHeaderBgLight} ${AdminStyles.tableHeaderBgDark}`}>
                <tr>
                  <th className={AdminStyles.tableHeaderClasses}>Name</th>
                  <th className={AdminStyles.tableHeaderClasses}>Email</th>
                  <th className={AdminStyles.tableHeaderClasses}>Current Course</th>
                  <th className={AdminStyles.tableHeaderClasses}>Progress</th>
                  <th className={AdminStyles.tableHeaderClasses}>Status</th>
                  <th className={`${AdminStyles.tableHeaderClasses} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${AdminStyles.tableBorderLight} ${AdminStyles.tableBorderDark}`}>
                {students.map((student) => (
                  <tr key={student.id} className={`${AdminStyles.tableRowBgLight} ${AdminStyles.tableRowBgDark}`}>
                    <td className={`p-4 align-middle font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{student.name}</td>
                    <td className={AdminStyles.tableCellClasses}>{student.email}</td>
                    <td className={AdminStyles.tableCellClasses}>{student.courseName}</td>
                    <td className={AdminStyles.tableCellClasses}>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className={`h-1.5 w-20 sm:w-24 [&>div]:${student.status === 'at risk' ? 'bg-yellow-500' : `bg-[${AdminStyles.accentColor}]`}`} />
                        <span className="text-xs font-medium">{student.progress}%</span>
                      </div>
                    </td>
                    <td className={AdminStyles.tableCellClasses}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className={`${AdminStyles.tableCellClasses} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className={`${AdminStyles.ghostButtonClasses} h-8 w-8`} onClick={() => navigate(`/admin/student/${student.id}`)}>
                          <span className="sr-only">View Student</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`${AdminStyles.ghostButtonClasses} h-8 w-8`} onClick={() => navigate(`/admin/student/${student.id}/edit`)}>
                          <span className="sr-only">Edit Student</span>
                          <Edit className="h-4 w-4" />
                        </Button>
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
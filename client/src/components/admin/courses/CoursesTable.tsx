import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Edit } from "lucide-react";
import { Course } from "../../../types/admin";
import { getStatusBadgeClasses } from "../../../utils/adminUtils";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface CoursesTableProps {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

export const CoursesTable: React.FC<CoursesTableProps> = ({ courses, isLoading, error }) => {
  return (
    <Card className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardContent className="p-0">
        <DataDisplayWrapper isLoading={isLoading} error={error} count={courses.length} loadingText="Loading courses..." noDataMessage="No courses found matching your criteria.">
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className={`${AdminStyles.tableHeaderBgLight} ${AdminStyles.tableHeaderBgDark}`}>
                <tr>
                  <th className={AdminStyles.tableHeaderClasses}>Course Title</th>
                  <th className={AdminStyles.tableHeaderClasses}>Students</th>
                  <th className={AdminStyles.tableHeaderClasses}>Start Date</th>
                  <th className={AdminStyles.tableHeaderClasses}>End Date</th>
                  <th className={AdminStyles.tableHeaderClasses}>Status</th>
                  <th className={`${AdminStyles.tableHeaderClasses} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className={`${AdminStyles.tableRowBgLight} ${AdminStyles.tableRowBgDark}`}>
                    <td className={`p-4 align-middle font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{course.title}</td>
                    <td className={AdminStyles.tableCellClasses}>{course.studentCount}</td>
                    <td className={AdminStyles.tableCellClasses}>{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}</td>
                    <td className={AdminStyles.tableCellClasses}>{course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}</td>
                    <td className={AdminStyles.tableCellClasses}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status || 'upcoming')}`}>
                        {(course.status || 'upcoming').charAt(0).toUpperCase() + (course.status || 'upcoming').slice(1)}
                      </span>
                    </td>
                    <td className={`${AdminStyles.tableCellClasses} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/courses/manage/${course.id}`}>
                          <Button variant="ghost" size="icon" className={`${AdminStyles.ghostButtonClasses} h-8 w-8`}>
                            <span className="sr-only">Manage Course Content</span>
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
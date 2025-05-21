import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { BookOpen, Users, ArrowUpRight } from "lucide-react";
import { CourseSummary } from "../../../types/admin";
import { getStatusBadgeClasses } from "../../../utils/adminUtils";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface DashboardCourseStatusCardProps {
  courses: CourseSummary[];
  isLoading: boolean;
  error: string | null;
  onManageCourses: () => void;
}

export const DashboardCourseStatusCard: React.FC<DashboardCourseStatusCardProps> = ({ courses, isLoading, error, onManageCourses }) => {
  const navigate = useNavigate();
  return (
    <Card className={`lg:col-span-2 ${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardHeader>
        <CardTitle className={`${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark} font-serif`}>Course Status</CardTitle>
        <CardDescription className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>Overview of program courses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DataDisplayWrapper isLoading={isLoading} error={error} count={courses.length} loadingText="Loading courses..." noDataMessage="No courses to display.">
          {courses.map((course) => (
            <div key={course.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${AdminStyles.tableBorderLight} ${AdminStyles.tableBorderDark} gap-3`}>
              <div className="flex items-center gap-3 flex-1">
                <BookOpen className={`h-5 w-5 text-[${AdminStyles.accentColor}] flex-shrink-0`} />
                <div>
                  <p className={`font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{course.title}</p>
                  <p className={`text-xs ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>
                    {course.startDate && course.endDate ? `${new Date(course.startDate).toLocaleDateString()} - ${new Date(course.endDate).toLocaleDateString()}` : 'Dates N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-shrink-0">
                <div className={`flex items-center gap-1 text-sm ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>
                  <Users className="h-4 w-4" />
                  <span>{course.studentCount}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(course.status)}`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className={`${AdminStyles.ghostButtonClasses} text-xs px-2 py-1 h-auto`} onClick={() => {
                  navigate(`/admin/courses?courseId=${course.courseId || course.id}`);
                }}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </DataDisplayWrapper>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className={`w-full ${AdminStyles.outlineButtonClasses}`} onClick={onManageCourses}>
          Manage Courses <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
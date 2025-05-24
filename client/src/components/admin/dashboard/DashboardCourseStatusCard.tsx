import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { BookOpen, Users, ChevronDown, ChevronUp } from "lucide-react";
import { CourseSummary } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface DashboardCourseStatusCardProps {
  courses: CourseSummary[];
  isLoading: boolean;
  error: string | null;
}

export const DashboardCourseStatusCard: React.FC<DashboardCourseStatusCardProps> = ({ courses, isLoading, error }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const DISPLAY_LIMIT = 3;

  const displayedCourses = showAll ? courses : courses.slice(0, DISPLAY_LIMIT);

  return (
    <Card className={`lg:col-span-2 ${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className={`${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark} font-serif`}>Course Status</CardTitle>
          <CardDescription className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>Overview of program courses</CardDescription>
        </div>
        <Button 
          variant="outline" 
          className={`${AdminStyles.outlineButtonClasses}`}
          onClick={() => navigate('/admin/courses')}
        >
          View All Courses
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <DataDisplayWrapper isLoading={isLoading} error={error} count={courses.length} loadingText="Loading courses..." noDataMessage="No courses to display.">
          {displayedCourses.map((course) => (
            <div key={course.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border ${AdminStyles.tableBorderLight} ${AdminStyles.tableBorderDark} gap-3`}>
              <div className="flex items-center gap-3 flex-1">
                <BookOpen className={`h-5 w-5 text-[${AdminStyles.accentColor}] flex-shrink-0`} />
                <div>
                  <p className={`font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{course.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-shrink-0">
                <div className={`flex items-center gap-1 text-sm ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>
                  <Users className="h-4 w-4" />
                  <span>{course.studentCount}</span>
                </div>
              </div>
            </div>
          ))}
          {courses.length > DISPLAY_LIMIT && (
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? "Show Less" : `Show All (${courses.length})`}
            </Button>
          )}
        </DataDisplayWrapper>
      </CardContent>
    </Card>
  );
};
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { UserCircle, ArrowUpRight } from "lucide-react";
import { StudentSummary } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface RecentStudentsCardProps {
  students: StudentSummary[];
  isLoading: boolean;
  error: string | null;
  onManageStudents: () => void;
}

export const RecentStudentsCard: React.FC<RecentStudentsCardProps> = ({ students, isLoading, error, onManageStudents }) => {
  return (
    <Card className={`lg:col-span-1 ${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
      <CardHeader>
        <CardTitle className={`${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark} font-serif`}>Recent Students</CardTitle>
        <CardDescription className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>Overview of student activity</CardDescription>
      </CardHeader>
      <CardContent>
        <DataDisplayWrapper isLoading={isLoading} error={error} count={students.length} loadingText="Loading recent students..." noDataMessage="No recent student activity.">
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserCircle className={`h-8 w-8 ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark} flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-medium ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{student.name}</p>
                    <p className={`text-xs ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>{student.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Progress value={student.progress} className={`h-2 w-16 sm:w-20 [&>div]:bg-[${AdminStyles.accentColor}]`} />
                  <span className={`text-xs font-medium ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`}>{student.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </DataDisplayWrapper>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className={`w-full ${AdminStyles.outlineButtonClasses}`} onClick={onManageStudents}>
          Manage Students <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
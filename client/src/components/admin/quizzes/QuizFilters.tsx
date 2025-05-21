import React from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Search, HelpCircle } from "lucide-react"; // HelpCircle for quiz icon
import { Course } from "../../../types/admin";
import * as AdminStyles from "../../../styles/adminStyles";

interface QuizFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  availableCourses: Pick<Course, "id" | "title">[];
}

export const QuizFilters: React.FC<QuizFiltersProps> = ({
  search,
  onSearchChange,
  courseFilter,
  onCourseFilterChange,
  availableCourses
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`} />
          <Input
            placeholder="Search quizzes..."
            className={`pl-8 ${AdminStyles.inputClasses}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={courseFilter} onValueChange={onCourseFilterChange}>
          <SelectTrigger className={AdminStyles.selectTriggerClasses}>
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent className={AdminStyles.selectContentClasses}>
            <SelectItem value="all">All Courses</SelectItem>
            {availableCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Link to="/admin/quizzes/manage">
        <Button className={AdminStyles.primaryButtonClasses}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Manage All Quizzes
        </Button>
      </Link>
    </div>
  );
};
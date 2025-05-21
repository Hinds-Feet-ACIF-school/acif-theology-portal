import React from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Search, BookOpen } from "lucide-react";
import * as AdminStyles from "../../../styles/adminStyles";

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({ search, onSearchChange, statusFilter, onStatusFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`} />
          <Input
            placeholder="Search courses..."
            className={`pl-8 ${AdminStyles.inputClasses}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className={AdminStyles.selectTriggerClasses}>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className={AdminStyles.selectContentClasses}>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Link to="/admin/courses/manage">
        <Button className={AdminStyles.primaryButtonClasses}>
          <BookOpen className="mr-2 h-4 w-4" />
          Manage Course Structure
        </Button>
      </Link>
    </div>
  );
};
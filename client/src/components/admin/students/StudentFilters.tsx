import React from "react";
import { Link } from "react-router-dom";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Search, Users } from "lucide-react";
import * as AdminStyles from "../../../styles/adminStyles";

interface StudentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({ search, onSearchChange, statusFilter, onStatusFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`} />
          <Input
            placeholder="Search students..."
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
            <SelectItem value="at risk">At Risk</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Link to="/admin/students/manage">
        <Button className={AdminStyles.primaryButtonClasses}>
          <Users className="mr-2 h-4 w-4" />
          Manage All Students
        </Button>
      </Link>
    </div>
  );
};
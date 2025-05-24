import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/button";
import { Settings, LogOut } from "lucide-react";
import * as AdminStyles from "../../../styles/adminStyles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { getAllCohorts } from "../../../services/api";

interface AdminPageHeaderProps {
  onLogout: () => void;
  authLoading: boolean;
  onCohortChange?: (cohortId: string) => void;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ onLogout, authLoading, onCohortChange }) => {
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCohort, setSelectedCohort] = useState<string>("all");

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const data = await getAllCohorts();
        setCohorts(data);
      } catch (error) {
        console.error("Error fetching cohorts:", error);
      }
    };
    fetchCohorts();
  }, []);

  const handleCohortChange = (value: string) => {
    setSelectedCohort(value);
    if (onCohortChange) {
      onCohortChange(value);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
      <div>
        <h1 className={`text-3xl font-bold font-serif tracking-tight ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>Admin Dashboard</h1>
        <p className={`${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark} mt-1`}>Manage program content</p>
      </div>
      <div className="flex gap-2 items-center">
        <Select value={selectedCohort} onValueChange={handleCohortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {cohorts.map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link to="/admin/settings">
          <Button variant="outline" size="sm" className={AdminStyles.outlineButtonClasses}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className={`${AdminStyles.outlineButtonClasses} text-red-600 dark:text-red-400 border-red-400/50 dark:border-red-400/50 hover:border-red-600 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-300`}
          onClick={onLogout}
          disabled={authLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
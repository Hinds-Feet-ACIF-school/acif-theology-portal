// server/controllers/cohort.controller.js
import { getAvailableCohorts as getCohortsUtil } from '../utils/cohortHelper.js';

export const getAvailableCohorts = (req, res) => {
  try {
    const cohorts = getCohortsUtil();
    res.status(200).json(cohorts);
  } catch (error) {
    console.error("Error fetching available cohorts:", error);
    res.status(500).json({ message: "Failed to retrieve available cohorts." });
  }
};
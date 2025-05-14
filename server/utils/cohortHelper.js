// server/utils/cohortHelper.js
export function getAvailableCohorts() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 (Jan) to 11 (Dec)

  let ongoingCohortMonth, ongoingCohortYear;
  let nextCohortMonth, nextCohortYear;

  if (currentMonth >= 0 && currentMonth <= 5) { // Jan - June
    ongoingCohortMonth = "January";
    ongoingCohortYear = currentYear;
    nextCohortMonth = "July";
    nextCohortYear = currentYear;
  } else { // July - December
    ongoingCohortMonth = "July";
    ongoingCohortYear = currentYear;
    nextCohortMonth = "January";
    nextCohortYear = currentYear + 1;
  }

  const ongoingCohortId = `${ongoingCohortMonth.toUpperCase().substring(0,3)}${ongoingCohortYear}`;
  const nextCohortId = `${nextCohortMonth.toUpperCase().substring(0,3)}${nextCohortYear}`;

  return [
    { id: ongoingCohortId, name: `${ongoingCohortMonth} ${ongoingCohortYear} Intake` },
    { id: nextCohortId, name: `${nextCohortMonth} ${nextCohortYear} Intake` },
  ];
}
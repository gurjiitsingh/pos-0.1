const TERMINAL_CODE = 'P2';

function getFinancialYearCode() {

  const now = new Date();

  const year = now.getFullYear();

  const month = now.getMonth() + 1;

  let startYear;
  let endYear;

  if (month >= 4) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  return `${startYear % 100}${endYear % 100}`;
}

module.exports = {
  TERMINAL_CODE,
  getFinancialYearCode,
};
const {
  majorList,
  departmentList,
  positionMapping,
  validSessions,
} = require("./constant");

function formatValue(value, options = {}) {
  if (value === null || value === undefined || value === "") return null;

  const {
    trim = true,
    toLowerCase = false,
    toUpperCase = false,
    maxLength,
    datatype,
    defaultValue,
    decimals,
    thousandsSeparator = ",",
    decimalSeparator = ".",
    dateFormat = "YYYY-MM-DD",
    locale = "en-US",
  } = options;

  // Boolean yes/no validation
  if (datatype === "boolean" && typeof value === "string") {
    const lowercaseValue = value.toLowerCase().trim();
    if (lowercaseValue === "yes" || lowercaseValue === "y") {
      return true;
    } else if (lowercaseValue === "no" || lowercaseValue === "n") {
      return false;
    }
  }

  // Convert to appropriate datatype
  switch (datatype) {
    case "boolean":
      return typeof value === "string"
        ? value.toLowerCase() === "true"
        : Boolean(value);
    case "number":
      const num = Number(value);
      if (isNaN(num)) return defaultValue;

      let formattedNum =
        decimals !== undefined ? num.toFixed(decimals) : num.toString();
      const parts = formattedNum.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      return parts.join(decimalSeparator);

    case "date":
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return defaultValue;

      return date.toLocaleDateString(locale, {
        year: dateFormat.includes("YYYY") ? "numeric" : undefined,
        month: dateFormat.includes("MM") ? "2-digit" : undefined,
        day: dateFormat.includes("DD") ? "2-digit" : undefined,
      });

    case "array":
      if (!Array.isArray(value)) {
        return defaultValue || [];
      }
      return value;

    default:
      // String operations
      let formattedValue = String(value);

      if (trim) {
        formattedValue = formattedValue.trim();
      }

      if (toLowerCase) {
        formattedValue = formattedValue.toLowerCase();
      }

      if (toUpperCase) {
        formattedValue = formattedValue.toUpperCase();
      }

      if (maxLength && formattedValue.length > maxLength) {
        formattedValue = formattedValue.substring(0, maxLength);
      }

      if (formattedValue === "" && defaultValue !== undefined) {
        return defaultValue;
      }

      return formattedValue;
  }
}

function getCurrentSemester() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = now.getMonth();
  if (month < 5) {
    return `SPRING${year}`;
  } else if (month < 8) {
    return `SUMMER${year}`;
  } else {
    return `FALL${year}`;
  }
}

function getMajorCode(majorName) {
  let majorCode = majorList.find((code) => code[1] === majorName);
  return majorCode[0];
}

function getFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}

function splitSchoolCode(school) {
  if (school) {
    return school.split(" - ")[0];
  }
  return null;
}

function splitEmail(email) {
  return email.split("@")[0];
}

function splitNameNetworkId(str) {
  const [fullName, email] = str.split(" - ");
  const networkId = splitEmail(email);
  return { fullName, networkId };
}

function getDepartmentCode(department) {
  // spelling error in the department name - can't change right now, so hard code the actual spelling
  if (department === "Biomedical Enigneering") {
    department = "Biomedical Engineering";
  } else if (department === "Physiology and Biophysics") {
    department = "Physiology & Biophysics";
  }
  let departmentCode = departmentList.find((code) => code[1] === department);
  return departmentCode[0];
}

function mapPosition(position) {
  return positionMapping[position];
}

function getSession(session) {
  if (session.toLowerCase().includes("session 1")) {
    return validSessions[0];
  }
  if (session.toLowerCase().includes("session 2")) {
    return validSessions[1];
  }
  if (session.toLowerCase().includes("both")) {
    return validSessions[2];
  }
}

module.exports = {
  formatValue,
  getCurrentSemester,
  getMajorCode,
  getFullName,
  splitNameNetworkId,
  splitSchoolCode,
  getDepartmentCode,
  splitEmail,
  mapPosition,
  getSession,
};

const { JudgeProjectMapping } = require("../utilities/class-file");
const { getCurrentSemester } = require("../utilities/utils");
const { COLUMN, TABLE } = require("../models/schema");
const { writeCSV } = require("../utilities/file-access");
const {
  judgeHeaders,
  studentHeaders,
  judgeString,
  studentString,
  schoolList,
  projectString,
} = require("../utilities/constant");
const path = require("path");

function downloadMapping() {
  return new Promise(async (resolve, reject) => {
    let semester = getCurrentSemester();
    let mappings = await JudgeProjectMapping.getJudgeProjectMappings(semester);
    /*
    judge.csv: 
    
    first name,last name, networkid, assigned count, remaining count, session, {
      1-6:[student full name, networkid, project title, project research category, project keyword 1,2,3 , student major, school]
    } 

    future work: student.csv:
    full name, networkid, project title, project research category, student major, school, {
      1-2:[judge first name,last name, networkid, session, judge keyword 1,2,3, judge outside, assigned count, remaining count, research category, discipline, department, school]
    }
    */

    let schoolMap = schoolList.reduce((acc, [code, name]) => {
      acc[code] = name;
      return acc;
    }, {});

    let judgeMap = {};

    for (let mapping of mappings) {
      let judgeId = mapping[COLUMN.JudgeProjectMapping.JudgeId];
      if (judgeMap[judgeId] === undefined) {
        judgeMap[judgeId] = [];
      }
      judgeMap[judgeId].push(mapping);
    }
    let judgeCSVPath = path.join(
      __filename,
      "..",
      "..",
      "public",
      "uploads",
      semester + "-" + "judge.csv"
    );

    let judgeData = [];

    for (let judgeId in judgeMap) {
      let judge = judgeMap[judgeId][0];
      let judgeRow = {
        [COLUMN.Judges.FirstName]: judge[judgeString + COLUMN.Judges.FirstName],
        [COLUMN.Judges.LastName]: judge[judgeString + COLUMN.Judges.LastName],
        [COLUMN.Judges.NetworkId]: judge[judgeString + COLUMN.Judges.NetworkId],
        "Assigned Count": judgeMap[judgeId].length,
        "Remaining Count":
          judge[judgeString + COLUMN.JudgingScenario.Count] -
          judgeMap[judgeId].length,
        [COLUMN.JudgingScenario.Session]: judge["MappingSession"],
        Other: "",
      };
      let i = 1;
      for (let mapping of judgeMap[judgeId]) {
        let studentRow = {
          [COLUMN.Students.FullName + i]:
            mapping[studentString + COLUMN.Students.FullName],
          [COLUMN.Students.NetworkId + i]:
            mapping[studentString + COLUMN.Students.NetworkId],
          [COLUMN.Projects.Title + i]:
            mapping[projectString + COLUMN.Projects.Title],
          [COLUMN.Projects.ResearchCategory + i]:
            mapping[projectString + COLUMN.Projects.ResearchCategory],
          [COLUMN.Projects.Keyword1 + i]:
            mapping[projectString + COLUMN.Projects.Keyword1],
          [COLUMN.Projects.Keyword2 + i]:
            mapping[projectString + COLUMN.Projects.Keyword2],
          [COLUMN.Projects.Keyword3 + i]:
            mapping[projectString + COLUMN.Projects.Keyword3],
          [COLUMN.Students.MajorCodes + i]:
            mapping[studentString + TABLE.Major],
          [COLUMN.Students.School + i]:
            schoolMap[mapping[studentString + COLUMN.Students.School]],
          [COLUMN.Projects.PosterNumber + i]:
            mapping[projectString + COLUMN.Projects.PosterNumber],
        };
        Object.assign(judgeRow, studentRow);
        i++;
      }
      for (; i <= 6; i++) {
        let studentRow = {};
        studentRow[COLUMN.Students.FullName + i] = "";
        studentRow[COLUMN.Students.NetworkId + i] = "";
        studentRow[COLUMN.Projects.Title + i] = "";
        studentRow[COLUMN.Projects.ResearchCategory + i] = "";
        studentRow[COLUMN.Projects.Keyword1 + i] = "";
        studentRow[COLUMN.Projects.Keyword2 + i] = "";
        studentRow[COLUMN.Projects.Keyword3 + i] = "";
        studentRow[COLUMN.Students.MajorCodes + i] = "";
        studentRow[COLUMN.Students.School + i] = "";
        studentRow[COLUMN.Projects.PosterNumber + i] = "";
        Object.assign(judgeRow, studentRow);
      }
      judgeData.push(judgeRow);
    }

    addingAvailableJudges(semester)
      .then((availableJudges) => {
        return judgeData.concat(availableJudges);
      })
      .then((judgeData) => {
        writeCSV({
          filePath: judgeCSVPath,
          headers: judgeHeaders,
          data: judgeData,
        }).then((bool) => {
          if (!bool) {
            reject(new Error("Error writing judge csv"));
          }
          resolve(judgeCSVPath);
        });
      });
  });
}

function addingAvailableJudges(semester) {
  return new Promise(async (resolve, reject) => {
    let mappings =
      await JudgeProjectMapping.getAvaiableJudgesFromProjectMapping(semester);
    let judgeData = [];
    for (let judge of mappings) {
      let judgeRow = {
        [COLUMN.Judges.FirstName]: judge[judgeString + COLUMN.Judges.FirstName],
        [COLUMN.Judges.LastName]: judge[judgeString + COLUMN.Judges.LastName],
        [COLUMN.Judges.NetworkId]: judge[judgeString + COLUMN.Judges.NetworkId],
        "Assigned Count": 0,
        "Remaining Count": judge[judgeString + COLUMN.JudgingScenario.Count],
        [COLUMN.JudgingScenario.Session]: judge["MappingSession"],
        Other: `JudgeResearchCategory: ${
          judge[judgeString + "ResearchCategory"]
        }, JudgeDepartmentCode: ${
          judge[judgeString + "Department"]
        }, JudgeSchool: ${judge[judgeString + COLUMN.Judges.School]}`,
      };
      judgeData.push(judgeRow);
    }
    resolve(judgeData);
  });
}

module.exports = {
  downloadMapping,
};

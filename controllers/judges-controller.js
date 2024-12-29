const { judgeFields } = require("../utilities/constant");
const {
  Judges,
  JudgingScenario,
  JudgeProjectMapping,
} = require("../utilities/class-file");
const { v4: uuid } = require("uuid");
const {
  formatValue,
  getCurrentSemester,
  mapPosition,
  splitSchoolCode,
  getDepartmentCode,
  getSession,
} = require("../utilities/utils");
const pool = require("../utilities/mysql-config");
const { processMentor } = require("./student-controller");

async function processMentorRecord(row) {
  let mentorId = await processMentor(
    formatValue(row[judgeFields.mentor.firstName], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.mentor.lastName], {
      datatype: "string",
      trim: true,
    }),
    judgeFields.mentor,
    row
  );
  return mentorId;
}

async function processJudgeRecord(row, mentorId) {
  const judge = new Judges(
    uuid(),
    formatValue(row[judgeFields.firstName], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.lastName], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.networkId], {
      datatype: "string",
      trim: true,
    }),
    getDepartmentCode(
      formatValue(row[judgeFields.department], {
        datatype: "string",
        trim: true,
      })
    ),
    splitSchoolCode(
      formatValue(row[judgeFields.school], { datatype: "string", trim: true })
    ),
    mapPosition(
      formatValue(row[judgeFields.position], {
        datatype: "string",
        trim: true,
      })
    ),
    mentorId
  );

  try {
    let savedJudge = await judge.save();
    return savedJudge.JudgeId;
  } catch (error) {
    console.error("Error saving judge:", error);
    return null;
  }
}

async function processJudgingScenario(row, judgeId, currentSemester) {
  const judgingScenario = new JudgingScenario(
    judgeId,
    formatValue(row[judgeFields.judgeOutside], {
      datatype: "boolean",
    }),
    formatValue(row[judgeFields.judgeCount], { datatype: "number" }),
    getSession(
      formatValue(row[judgeFields.session], {
        datatype: "string",
        trim: true,
      })
    ),
    currentSemester,
    formatValue(row[judgeFields.discipline], {
      datatype: "string",
      trim: true,
      maxLength: 255,
    }),
    formatValue(row[judgeFields.keywords[0]], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.keywords[1]], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.keywords[2]], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[judgeFields.judgingCategory], {
      datatype: "string",
      trim: true,
    })
  );

  try {
    await judgingScenario.save();
  } catch (error) {
    console.error("Error saving judging scenario:", error);
  }
}

async function fromJudgeRecord(judgeData) {
  let currentSemester = getCurrentSemester();
  await pool.query("USE " + process.env.DB_NAME);
  for (const row of judgeData) {
    const mentorId = await processMentorRecord(row);
    const judgeId = await processJudgeRecord(row, mentorId);
    await processJudgingScenario(row, judgeId, currentSemester);
  }
}

function writeMapping(projects, semester) {
  let mappings = [];
  for (let project of projects) {
    if (project.Judge1 !== undefined && project.Judge2 !== undefined) {
      mappings.push({
        JudgeId: project.Judge1,
        ProjectId: project.ProjectId,
        Session: project.Session1,
        Semester: semester,
      });
      mappings.push({
        JudgeId: project.Judge2,
        ProjectId: project.ProjectId,
        Session: project.Session2,
        Semester: semester,
      });
    } else if (project.Judge1 !== undefined) {
      mappings.push({
        JudgeId: project.Judge1,
        ProjectId: project.ProjectId,
        Session: project.Session1,
        Semester: semester,
      });
    } else if (project.Judge2 !== undefined) {
      mappings.push({
        JudgeId: project.Judge2,
        ProjectId: project.ProjectId,
        Session: project.Session2,
        Semester: semester,
      });
    }
  }
  JudgeProjectMapping.saveBulk(mappings);
}

module.exports = { fromJudgeRecord, writeMapping };

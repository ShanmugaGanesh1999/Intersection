const { getCurrentSemester } = require("../utilities/utils");
const {
  validAwardCategories,
  validSessions,
  majorVsDeptMap,
} = require("../utilities/constant");
const { Projects, Judges } = require("../utilities/class-file");
const { writeMapping } = require("./judges-controller");
const { COLUMN } = require("../models/schema");

/**
 * This function computes the mapping of judges to projects
 * @returns {Promise<void>}
 */
async function computeMapping() {
  let currentSemester = getCurrentSemester();
  let projects = await populateProjectTable(currentSemester);
  let judges = await Judges.getJudgesByCriteria(currentSemester, [
    COLUMN.JudgingScenario.ResearchCategory,
    COLUMN.JudgingScenario.Count,
    COLUMN.JudgingScenario.Session,
    COLUMN.JudgingScenario.JudgeOutside,
    COLUMN.Judges.MentorId,
    COLUMN.Judges.DepartmentCode,
  ]);

  let judgeCount = {};
  for (let judge of judges) {
    judgeCount[judge.JudgeId] = judge.Count;
    delete judge.Count;
  }

  // actual matching
  for (let [_, group] of Object.entries(majorVsDeptMap)) {
    let filteredJudges = judges.filter((judge) =>
      group.departments.includes(judge.DepartmentCode)
    );
    let filteredProjects = projects.filter((project) =>
      group.majors.includes(project.MajorCodes)
    );

    await performMatching(filteredJudges, filteredProjects, judgeCount);
  }

  // mapping using research category
  for (let category of validAwardCategories) {
    let filteredJudges = judges.filter(
      (judge) => judge.ResearchCategory === category
    );
    let filteredProjects = projects.filter(
      (project) => project.ResearchCategory === category
    );

    await performMatching(filteredJudges, filteredProjects, judgeCount);
  }

  // improper mapping
  {
    let filteredJudges = judges.filter(
      (judge) => judgeCount[judge.JudgeId] > 0 && judge.JudgeOutside
    );
    let filteredProjects = projects.filter(
      (project) =>
        (project.Judge1 === undefined && project.Judge2 === undefined) ||
        (project.Judge1 !== undefined && project.Judge2 === undefined) ||
        (project.Judge1 === undefined && project.Judge2 !== undefined)
    );

    await performMatching(filteredJudges, filteredProjects, judgeCount);
  }

  await writeMapping(projects, currentSemester);

  let leftOverJudges = judges
    .filter((judge) => judgeCount[judge.JudgeId] > 0 && judge.JudgeOutside)
    .map((judge) => ({ ...judge, Count: judgeCount[judge.JudgeId] }));

  return { leftOverJudges, projects };
}

/**
 * This function performs the matching of judges to projects
 * @param {*} filteredJudges
 * @param {*} filteredProjects
 * @param {*} judgeCount
 */
function performMatching(filteredJudges, filteredProjects, judgeCount) {
  for (let judge of filteredJudges) {
    for (let project of filteredProjects) {
      if (
        !project.done && // check if the project is already assigned
        judgeCount[judge.JudgeId] > 0 && // check if the judge has any projects left
        project.MentorId !== judge.MentorId && // check if the mentor is not same between student and judge
        project.Judge1 !== judge.JudgeId && // check if this judge is not already assigned in any of the judge slots
        project.Judge2 !== judge.JudgeId
      ) {
        if (project.Judge1 === undefined) {
          project.Judge1 = judge.JudgeId;
          project.Session1 =
            judge.Session === validSessions[2]
              ? validSessions[0]
              : judge.Session;
          judgeCount[judge.JudgeId]--;
        } else if (project.Judge2 === undefined) {
          project.Judge2 = judge.JudgeId;
          project.Session2 =
            judge.Session === validSessions[2]
              ? validSessions[0]
              : judge.Session;
          judgeCount[judge.JudgeId]--;
        }
        if (project.Judge1 !== undefined && project.Judge2 !== undefined) {
          project.done = true;
        }
      }
    }
  }
}

/**
 * This function populates the project table
 * @param {string} currentSemester
 */
async function populateProjectTable(currentSemester) {
  let table = [];
  let projects = await Projects.getJudgedProjects(currentSemester, [
    COLUMN.Projects.MentorId,
    COLUMN.Projects.ResearchCategory,
    COLUMN.Students.MajorCodes,
  ]);
  projects.forEach((project) => {
    let row = {
      ProjectId: project.ProjectId,
      mentorId: project.MentorId,
      ResearchCategory: project.ResearchCategory,
      MajorCodes: project.MajorCodes,
      Judge1: undefined,
      Session1: undefined,
      Judge2: undefined,
      Session2: undefined,
      done: false,
    };
    table.push(row);
  });
  return table;
}

module.exports = {
  computeMapping,
};

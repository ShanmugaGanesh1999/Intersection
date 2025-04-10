const TABLE = {
  Students: "Students",
  Projects: "Projects",
  Mentors: "Mentors",
  StudentProjectMapping: "StudentProjectMapping",
  JudgeProjectMapping: "JudgeProjectMapping",
  JudgingScenario: "JudgingScenario",
  School: "School",
  Major: "Major",
  Judges: "Judges",
  Department: "Department",
};

const COLUMN = {
  Students: {
    StudentId: "StudentId",
    FullName: "FullName",
    NetworkId: "NetworkId",
    MajorCodes: "MajorCodes",
    School: "School",
  },
  Projects: {
    ProjectId: "ProjectId",
    Title: "Title",
    MentorId: "MentorId",
    IsCapstone: "IsCapstone",
    CapstoneMentorId: "CapstoneMentorId",
    getJudged: "getJudged",
    Session: "Session",
    BoardSize: "BoardSize",
    Needs: "Needs",
    Keyword1: "Keyword1",
    Keyword2: "Keyword2",
    Keyword3: "Keyword3",
    Leader: "Leader",
    ResearchCategory: "ResearchCategory",
    PIId: "PIId",
    Electricity: "Electricity",
    PosterNumber: "PosterNumber",
  },
  Mentors: {
    MentorId: "MentorId",
    FirstName: "FirstName",
    LastName: "LastName",
    NetworkId: "NetworkId",
    DepartmentCode: "DepartmentCode",
    School: "School",
  },
  Judges: {
    JudgeId: "JudgeId",
    FirstName: "FirstName",
    LastName: "LastName",
    NetworkId: "NetworkId",
    DepartmentCode: "DepartmentCode",
    School: "School",
    Position: "Position",
    MentorId: "MentorId",
  },
  StudentProjectMapping: {
    StudentId: "StudentId",
    ProjectId: "ProjectId",
    Semester: "Semester",
  },
  JudgeProjectMapping: {
    JudgeId: "JudgeId",
    ProjectId: "ProjectId",
    Semester: "Semester",
    Session: "Session",
  },
  JudgingScenario: {
    JudgeId: "JudgeId",
    JudgeOutside: "JudgeOutside",
    Count: "Count",
    Session: "Session",
    Keywords1: "Keywords1",
    Keywords2: "Keywords2",
    Keywords3: "Keywords3",
    Discipline: "Discipline",
    ResearchCategory: "ResearchCategory",
    Semester: "Semester",
  },
  School: {
    SchoolId: "SchoolId",
    SchoolName: "SchoolName",
  },
  Major: {
    MajorCode: "MajorCode",
    MajorName: "MajorName",
  },
  Department: {
    DepartmentCode: "DepartmentCode",
    DepartmentName: "DepartmentName",
  },
};

module.exports = {
  TABLE,
  COLUMN,
};

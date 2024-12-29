const pool = require("./mysql-config");
const { TABLE, COLUMN } = require("../models/schema");

class Students {
  constructor(studentId, fullName, networkId, majorCode, school) {
    this.StudentId = studentId;
    this.FullName = fullName;
    this.NetworkId = networkId;
    this.MajorCodes = majorCode;
    this.School = school;
  }

  async save() {
    const existingStudent = await Students.getByNetworkId(this.NetworkId);

    if (!existingStudent) {
      const insertQuery = `INSERT INTO Students (StudentId, FullName, NetworkId, MajorCodes, School) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await pool.query(insertQuery, [
        this.StudentId,
        this.FullName,
        this.NetworkId,
        this.MajorCodes,
        this.School,
      ]);
      if (result.affectedRows > 0) {
        return { StudentId: this.StudentId };
      }
    } else {
      return existingStudent;
    }
  }
  static async getByNetworkId(networkId) {
    const query = `SELECT * FROM Students WHERE NetworkId = ?`;
    const [rows] = await pool.query(query, [networkId]);
    return rows[0];
  }
}

class Projects {
  constructor(
    projectId,
    title,
    mentorId,
    isCapstone,
    capstoneMentorId,
    getJudged,
    session,
    boardSize,
    needs,
    keyword1,
    keyword2,
    keyword3,
    leader,
    piId,
    researchCategory,
    posterNumber
  ) {
    this.ProjectId = projectId;
    this.Title = title;
    this.MentorId = mentorId;
    this.IsCapstone = isCapstone;
    this.CapstoneMentorId = capstoneMentorId;
    this.getJudged = getJudged;
    this.Session = session;
    this.BoardSize = boardSize;
    this.Needs = needs;
    this.Keyword1 = keyword1;
    this.Keyword2 = keyword2;
    this.Keyword3 = keyword3;
    this.Leader = leader;
    this.ResearchCategory = researchCategory;
    this.PiId = piId;
    this.PosterNumber = posterNumber;
  }

  static async getByTitle(title) {
    const query = `SELECT * FROM Projects WHERE Title = ?`;
    const [rows] = await pool.query(query, [title]);
    return rows[0];
  }

  async save() {
    const existingProject = await Projects.getByTitle(this.Title);

    if (!existingProject) {
      const query = `INSERT INTO Projects SET ?`;
      const [result] = await pool.query(query, this);
      if (result.affectedRows > 0) {
        return { ProjectId: this.ProjectId };
      }
    } else {
      return existingProject;
    }
  }

  static async getJudgedProjects(semester, columns) {
    let getJudged = 1;
    const query = `
      SELECT ProjectId, ${columns.join(
        ", "
      )} FROM Projects a join Students b on b.studentid = a.leader
      WHERE getJudged = ${getJudged} 
      AND ResearchCategory IS NOT NULL
      AND ProjectId IN (
        SELECT DISTINCT(ProjectId) 
        FROM StudentProjectMapping 
        WHERE Semester = '${semester}'
      )
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
}

class Mentors {
  constructor(
    mentorId,
    firstName,
    lastName,
    networkId,
    departmentCode,
    school
  ) {
    this.MentorId = mentorId;
    this.FirstName = firstName;
    this.LastName = lastName;
    this.NetworkId = networkId;
    this.DepartmentCode = departmentCode;
    this.School = school;
  }

  async save() {
    const existingMentor = await Mentors.getByNetworkId(this.NetworkId);
    if (!existingMentor) {
      const query = `INSERT INTO Mentors (MentorId, FirstName, LastName, NetworkId, DepartmentCode, School) VALUES (?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.query(query, [
        this.MentorId,
        this.FirstName,
        this.LastName,
        this.NetworkId,
        this.DepartmentCode,
        this.School,
      ]);
      if (result.affectedRows > 0) {
        return { MentorId: this.MentorId };
      }
    } else {
      return existingMentor;
    }
  }

  static async getByNetworkId(networkId) {
    const query = `SELECT * FROM Mentors WHERE NetworkId = ?`;
    const [rows] = await pool.query(query, [networkId]);
    return rows[0];
  }
}

class Judges {
  constructor(
    judgeId,
    firstName,
    lastName,
    networkId,
    departmentCode,
    school,
    position,
    mentorId
  ) {
    this.JudgeId = judgeId;
    this.FirstName = firstName;
    this.LastName = lastName;
    this.NetworkId = networkId;
    this.DepartmentCode = departmentCode;
    this.School = school;
    this.Position = position;

    this.MentorId = mentorId;
  }

  async save() {
    const existingJudge = await Judges.getByNetworkId(this.NetworkId);
    if (!existingJudge) {
      const query = `INSERT INTO Judges SET ?`;
      const [result] = await pool.query(query, this);
      if (result.affectedRows > 0) {
        return { JudgeId: this.JudgeId };
      }
    } else {
      return existingJudge;
    }
  }

  static async getByNetworkId(networkId) {
    const query = `SELECT * FROM Judges WHERE NetworkId = ?`;
    const [rows] = await pool.query(query, [networkId]);
    return rows[0];
  }

  static async getJudgesByCriteria(semester, columns) {
    const query = `
      SELECT a.JudgeId, ${columns.join(", ")} 
      FROM Judges a 
      JOIN JudgingScenario b 
      ON a.JudgeId = b.JudgeId 
      WHERE b.Semester = '${semester}' 
      AND b.ResearchCategory IS NOT NULL 
      `;
    const [rows] = await pool.query(query);
    return rows;
  }
}

class StudentProjectMapping {
  constructor(studentId, projectId, semester) {
    this.StudentId = studentId;
    this.ProjectId = projectId;
    this.Semester = semester;
  }

  static async saveBulk(mappings) {
    if (!mappings || mappings.length === 0) return;

    const query = `INSERT INTO StudentProjectMapping (StudentId, ProjectId, Semester) VALUES ?`;
    const values = mappings.map((mapping) => [
      mapping.StudentId,
      mapping.ProjectId,
      mapping.Semester,
    ]);
    try {
      const [result] = await pool.query(query, [values]);
      return result;
    } catch (error) {
      console.error("Error saving bulk mappings:", error, values);
      throw error;
    }
  }
}

class JudgeProjectMapping {
  constructor(judgeId, projectId, session, semester) {
    this.JudgeId = judgeId;
    this.ProjectId = projectId;
    this.Session = session;
    this.Semester = semester;
  }

  static async saveBulk(mappings) {
    if (!mappings || mappings.length === 0) return;

    const query = `INSERT INTO JudgeProjectMapping (JudgeId, ProjectId, Session, Semester) VALUES ?`;
    const values = mappings.map((mapping) => [
      mapping.JudgeId,
      mapping.ProjectId,
      mapping.Session,
      mapping.Semester,
    ]);

    const [result] = await pool.query(query, [values]);
    return result;
  }
  static async getJudgeProjectMappings(semester) {
    let getJudged = 1;
    const query = `
      SELECT 
      a.JudgeId,
      b.FirstName as JudgeFirstName,
      b.LastName as JudgeLastName,
      b.NetworkId as JudgeNetworkId,
      b.Position as JudgePosition,
      a.Session as MappingSession,
      e.ResearchCategory as JudgeResearchCategory,
      e.Keywords1 as JudgeKeywords1,
      e.Keywords2 as JudgeKeywords2,
      e.Keywords3 as JudgeKeywords3,
      e.JudgeOutside as JudgeOutside,
      e.Count as JudgeCount,
      e.Discipline as JudgeDiscipline,
      g.DepartmentName as JudgeDepartment,
      b.School as JudgeSchool,

      c.ProjectId,
      c.Title as ProjectTitle,
      d.FullName as StudentFullName,
      d.NetworkId as StudentNetworkId,
      f.MajorName as StudentMajor,
      d.School as StudentSchool,
      c.ResearchCategory as ProjectResearchCategory,
      c.Keyword1 as ProjectKeyword1,
      c.Keyword2 as ProjectKeyword2,
      c.Keyword3 as ProjectKeyword3,
      c.PosterNumber as ProjectPosterNumber

      FROM JudgeProjectMapping a 
      JOIN Judges b ON a.JudgeId = b.JudgeId 
      JOIN Projects c ON a.ProjectId = c.ProjectId 
      JOIN Students d ON c.Leader = d.StudentId 
      JOIN JudgingScenario e ON a.JudgeId = e.JudgeId 
      JOIN Major f ON d.MajorCodes = f.MajorCode
      JOIN Department g ON b.DepartmentCode = g.DepartmentCode
      WHERE a.Semester = '${semester}' 
      AND c.getJudged = ${getJudged}
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getAvaiableJudgesFromProjectMapping(semester) {
    const query = `
      SELECT 
      b.JudgeId,
      b.FirstName as JudgeFirstName,
      b.LastName as JudgeLastName,
      b.NetworkId as JudgeNetworkId,
      b.Position as JudgePosition,
      e.Session as MappingSession,
      e.ResearchCategory as JudgeResearchCategory,
      e.Keywords1 as JudgeKeywords1,
      e.Keywords2 as JudgeKeywords2,
      e.Keywords3 as JudgeKeywords3,
      e.JudgeOutside as JudgeOutside,
      e.Count as JudgeCount,
      e.Discipline as JudgeDiscipline,
      g.DepartmentName as JudgeDepartment,
      b.School as JudgeSchool
      
      FROM Judges b 
      JOIN JudgingScenario e ON b.JudgeId = e.JudgeId 
      JOIN Department g ON b.DepartmentCode = g.DepartmentCode
      WHERE b.JudgeId NOT IN (
        SELECT DISTINCT(JudgeId) FROM JudgeProjectMapping WHERE Semester = '${semester}'
      )
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
}

class JudgingScenario {
  constructor(
    judgeId,
    judgeOutside,
    count,
    session,
    semester,
    discipline,
    keywords1,
    keywords2,
    keywords3,
    researchCategory
  ) {
    this.JudgeId = judgeId;
    this.JudgeOutside = judgeOutside;
    this.Count = count;
    this.Session = session;
    this.Semester = semester;
    this.Discipline = discipline;
    this.Keywords1 = keywords1;
    this.Keywords2 = keywords2;
    this.Keywords3 = keywords3;
    this.ResearchCategory = researchCategory;
  }

  async save() {
    const existingScenario = await JudgingScenario.getById(
      this.Semester,
      this.JudgeId
    );
    if (!existingScenario) {
      const query = `INSERT INTO JudgingScenario SET ?`;
      const [result] = await pool.query(query, this);
      if (result.affectedRows > 0) {
        return { JudgeId: this.JudgeId, Semester: this.Semester };
      }
    } else {
      return existingScenario;
    }
  }

  static async getById(semester, judgeId) {
    const query = `SELECT * FROM JudgingScenario WHERE Semester = ? AND JudgeId = ?`;
    const [rows] = await pool.query(query, [semester, judgeId]);
    return rows[0];
  }
}

class School {
  constructor(schoolId, schoolName) {
    this.SchoolId = schoolId;
    this.SchoolName = schoolName;
  }

  static async saveBulk(schools, connection) {
    const [result] = await connection.query(
      `
      INSERT INTO ${TABLE.School} (${COLUMN.School.SchoolId}, ${COLUMN.School.SchoolName})
      VALUES ?
    `,
      [schools]
    );
    return result;
  }
}

class Major {
  constructor(majorCode, majorName) {
    this.MajorCode = majorCode;
    this.MajorName = majorName;
  }

  static async saveBulk(majors, connection) {
    const [result] = await connection.query(
      `
      INSERT INTO ${TABLE.Major} (${COLUMN.Major.MajorCode}, ${COLUMN.Major.MajorName}) 
      VALUES ? 
    `,
      [majors]
    );
    return result;
  }
}

class Department {
  constructor(departmentCode, departmentName) {
    this.DepartmentCode = departmentCode;
    this.DepartmentName = departmentName;
  }

  static async saveBulk(departments, connection) {
    const [result] = await connection.query(
      `
      INSERT INTO ${TABLE.Department} (${COLUMN.Department.DepartmentCode}, ${COLUMN.Department.DepartmentName})
      VALUES ?
    `,
      [departments]
    );
    return result;
  }
}

module.exports = {
  Students,
  Projects,
  Mentors,
  Judges,
  StudentProjectMapping,
  JudgeProjectMapping,
  JudgingScenario,
  School,
  Major,
  Department,
};

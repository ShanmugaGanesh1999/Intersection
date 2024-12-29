const pool = require("../utilities/mysql-config");
const {
  majorList,
  departmentList,
  schoolList,
  validSessions,
  validBoardSizes,
  validAwardCategories,
  validNeeds,
  positionMapping,
} = require("../utilities/constant");
const { TABLE, COLUMN } = require("../models/schema");
const { School, Major, Department } = require("../utilities/class-file");

// Create database if not exists
const createDatabaseIfNotExists = async () => {
  try {
    await pool.query("CREATE DATABASE IF NOT EXISTS Intersection");
    await pool.query("USE Intersection");
    console.log("Database 'Intersection' created or selected successfully");
  } catch (error) {
    console.error("Error creating or selecting database:", error);
    throw error;
  }
};

// Create all tables in a single transaction
const createAllTablesIfNotExist = async () => {
  await createDatabaseIfNotExists();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if tables exist
    const tableCheckQuery = `
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND TABLE_NAME IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [existingTables] = await connection.query(tableCheckQuery, [
      TABLE.Major,
      TABLE.School,
      TABLE.Students,
      TABLE.Mentors,
      TABLE.Judges,
      TABLE.Projects,
      TABLE.StudentProjectMapping,
      TABLE.JudgeProjectMapping,
      TABLE.JudgingScenario,
      TABLE.Department,
    ]);

    const existingTableSet = new Set(
      existingTables.map((row) => row.TABLE_NAME)
    );

    // Create tables that don't exist
    if (!existingTableSet.has(TABLE.Department)) {
      await createDepartmentTable(connection);
    }
    if (!existingTableSet.has(TABLE.Major)) {
      await createMajorTable(connection);
    }
    if (!existingTableSet.has(TABLE.School)) {
      await createSchoolTable(connection);
    }
    if (!existingTableSet.has(TABLE.Students)) {
      await createStudentTable(connection);
    }
    if (!existingTableSet.has(TABLE.Mentors)) {
      await createMentorTable(connection);
    }
    if (!existingTableSet.has(TABLE.Judges)) {
      await createJudgeTable(connection);
    }
    if (!existingTableSet.has(TABLE.Projects)) {
      await createProjectTable(connection);
    }
    if (!existingTableSet.has(TABLE.StudentProjectMapping)) {
      await createStudentProjectMappingTable(connection);
    }
    if (!existingTableSet.has(TABLE.JudgeProjectMapping)) {
      await createJudgeProjectMappingTable(connection);
    }
    if (!existingTableSet.has(TABLE.JudgingScenario)) {
      await createJudgingScenarioTable(connection);
    }

    await connection.commit();
    console.log("All tables created or verified successfully");
  } catch (error) {
    await connection.rollback();
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Individual table creation functions
const createDepartmentTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Department} (
      ${COLUMN.Department.DepartmentCode} VARCHAR(10) PRIMARY KEY,
      ${COLUMN.Department.DepartmentName} VARCHAR(255) NOT NULL
    )
  `);
  Department.saveBulk(departmentList, connection);
};

const createMajorTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Major} (
      ${COLUMN.Major.MajorCode} VARCHAR(10) PRIMARY KEY,
      ${COLUMN.Major.MajorName} VARCHAR(255) NOT NULL
    )
  `);
  Major.saveBulk(majorList, connection);
};

const createSchoolTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.School} (
      ${COLUMN.School.SchoolId} VARCHAR(255) PRIMARY KEY,
      ${COLUMN.School.SchoolName} VARCHAR(255) NOT NULL
    )
  `);
  School.saveBulk(schoolList, connection);
};

const createStudentTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Students} (
      ${COLUMN.Students.StudentId} VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
      ${COLUMN.Students.FullName} VARCHAR(255) NOT NULL,
      ${COLUMN.Students.NetworkId} VARCHAR(255) UNIQUE NOT NULL,
      ${COLUMN.Students.MajorCodes} VARCHAR(255),
      ${COLUMN.Students.School} VARCHAR(255),
      FOREIGN KEY (${COLUMN.Students.MajorCodes}) REFERENCES ${TABLE.Major}(${COLUMN.Major.MajorCode}),
      FOREIGN KEY (${COLUMN.Students.School}) REFERENCES ${TABLE.School}(${COLUMN.School.SchoolId})
    )
  `);
};

const createMentorTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Mentors} (
      ${COLUMN.Mentors.MentorId} VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
      ${COLUMN.Mentors.FirstName} VARCHAR(255) NOT NULL,
      ${COLUMN.Mentors.LastName} VARCHAR(255) NOT NULL,
      ${COLUMN.Mentors.NetworkId} VARCHAR(255) UNIQUE NOT NULL,
      ${COLUMN.Mentors.DepartmentCode} VARCHAR(255),
      ${COLUMN.Mentors.School} VARCHAR(255),
      FOREIGN KEY (${COLUMN.Mentors.DepartmentCode}) REFERENCES ${TABLE.Department}(${COLUMN.Department.DepartmentCode}),
      FOREIGN KEY (${COLUMN.Mentors.School}) REFERENCES ${TABLE.School}(${COLUMN.School.SchoolId})
    )
  `);
};

const createJudgeTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Judges} (
      ${COLUMN.Judges.JudgeId} VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
      ${COLUMN.Judges.FirstName} VARCHAR(255) NOT NULL,
      ${COLUMN.Judges.LastName} VARCHAR(255) NOT NULL,
      ${COLUMN.Judges.NetworkId} VARCHAR(255) UNIQUE NOT NULL,
      ${COLUMN.Judges.DepartmentCode} VARCHAR(255),
      ${COLUMN.Judges.School} VARCHAR(255),
      ${COLUMN.Judges.Position} ENUM(${Object.values(positionMapping)
    .map((pos) => `'${pos}'`)
    .join(", ")}) NOT NULL,
      ${COLUMN.Judges.MentorId} VARCHAR(255),
      FOREIGN KEY (${COLUMN.Judges.DepartmentCode}) REFERENCES ${
    TABLE.Department
  }(${COLUMN.Department.DepartmentCode}),
      FOREIGN KEY (${COLUMN.Judges.School}) REFERENCES ${TABLE.School}(${
    COLUMN.School.SchoolId
  }),
      FOREIGN KEY (${COLUMN.Judges.MentorId}) REFERENCES ${TABLE.Mentors}(${
    COLUMN.Mentors.MentorId
  })
    )
  `);
};

const createProjectTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.Projects} (
      ${COLUMN.Projects.ProjectId} VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
      ${COLUMN.Projects.Title} VARCHAR(255) NOT NULL,
      ${COLUMN.Projects.MentorId} VARCHAR(255),
      ${COLUMN.Projects.IsCapstone} BOOLEAN,
      ${COLUMN.Projects.CapstoneMentorId} VARCHAR(255),
      ${COLUMN.Projects.getJudged} BOOLEAN,
      ${COLUMN.Projects.Electricity} BOOLEAN,
      ${COLUMN.Projects.Session} ENUM(${validSessions
    .map((s) => `'${s}'`)
    .join(", ")}),
      ${COLUMN.Projects.BoardSize} ENUM(${validBoardSizes
    .map((s) => `'${s}'`)
    .join(", ")}),
      ${COLUMN.Projects.Needs} ENUM(${validNeeds
    .map((n) => `'${n}'`)
    .join(", ")}),
      ${COLUMN.Projects.Keyword1} VARCHAR(255),
      ${COLUMN.Projects.Keyword2} VARCHAR(255),
      ${COLUMN.Projects.Keyword3} VARCHAR(255),
      ${COLUMN.Projects.Leader} VARCHAR(255),
      ${COLUMN.Projects.PIId} VARCHAR(255),
      ${COLUMN.Projects.ResearchCategory} ENUM(${validAwardCategories
    .map((c) => `'${c}'`)
    .join(", ")}),
    ${COLUMN.Projects.PosterNumber} VARCHAR(255),
      FOREIGN KEY (${COLUMN.Projects.MentorId}) REFERENCES ${TABLE.Mentors}(${
    COLUMN.Mentors.MentorId
  }),
      FOREIGN KEY (${COLUMN.Projects.CapstoneMentorId}) REFERENCES ${
    TABLE.Mentors
  }(${COLUMN.Mentors.MentorId}),
      FOREIGN KEY (${COLUMN.Projects.Leader}) REFERENCES ${TABLE.Students}(${
    COLUMN.Students.StudentId
  }),
      FOREIGN KEY (${COLUMN.Projects.PIId}) REFERENCES ${TABLE.Mentors}(${
    COLUMN.Mentors.MentorId
  })
    )
  `);
};

const createStudentProjectMappingTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.StudentProjectMapping} (
      ${COLUMN.StudentProjectMapping.StudentId} VARCHAR(255),
      ${COLUMN.StudentProjectMapping.ProjectId} VARCHAR(255),
      ${COLUMN.StudentProjectMapping.Semester} VARCHAR(255),
      PRIMARY KEY (${COLUMN.StudentProjectMapping.StudentId}, ${COLUMN.StudentProjectMapping.ProjectId}, ${COLUMN.StudentProjectMapping.Semester}),
      FOREIGN KEY (${COLUMN.StudentProjectMapping.StudentId}) REFERENCES ${TABLE.Students}(${COLUMN.Students.StudentId}),
      FOREIGN KEY (${COLUMN.StudentProjectMapping.ProjectId}) REFERENCES ${TABLE.Projects}(${COLUMN.Projects.ProjectId})
    )
  `);
};

const createJudgeProjectMappingTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.JudgeProjectMapping} (
      ${COLUMN.JudgeProjectMapping.JudgeId} VARCHAR(255),
      ${COLUMN.JudgeProjectMapping.ProjectId} VARCHAR(255),
      ${COLUMN.JudgeProjectMapping.Semester} VARCHAR(255),
      ${COLUMN.JudgeProjectMapping.Session} ENUM(${validSessions
    .map((s) => `'${s}'`)
    .join(", ")}),
      PRIMARY KEY (${COLUMN.JudgeProjectMapping.JudgeId}, ${
    COLUMN.JudgeProjectMapping.ProjectId
  }, ${COLUMN.JudgeProjectMapping.Semester}),
      FOREIGN KEY (${COLUMN.JudgeProjectMapping.JudgeId}) REFERENCES ${
    TABLE.Judges
  }(${COLUMN.Judges.JudgeId}),
      FOREIGN KEY (${COLUMN.JudgeProjectMapping.ProjectId}) REFERENCES ${
    TABLE.Projects
  }(${COLUMN.Projects.ProjectId})
    )
  `);
};

const createJudgingScenarioTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE.JudgingScenario} (
      ${COLUMN.JudgingScenario.JudgeId} VARCHAR(255),
      ${COLUMN.JudgingScenario.JudgeOutside} BOOLEAN,
      ${COLUMN.JudgingScenario.Count} INTEGER CHECK (${
    COLUMN.JudgingScenario.Count
  } BETWEEN 1 AND 6),
      ${COLUMN.JudgingScenario.Session} ENUM(${validSessions
    .map((s) => `'${s}'`)
    .join(", ")}),
      ${COLUMN.JudgingScenario.Semester} VARCHAR(255),
      ${COLUMN.JudgingScenario.Discipline} VARCHAR(255),
      ${COLUMN.JudgingScenario.Keywords1} VARCHAR(255),
      ${COLUMN.JudgingScenario.Keywords2} VARCHAR(255),
      ${COLUMN.JudgingScenario.Keywords3} VARCHAR(255),
      ${COLUMN.JudgingScenario.ResearchCategory} ENUM(${validAwardCategories
    .map((c) => `'${c}'`)
    .join(", ")}),
      PRIMARY KEY (${COLUMN.JudgingScenario.JudgeId},${
    COLUMN.JudgingScenario.Semester
  }),
      FOREIGN KEY (${COLUMN.JudgingScenario.JudgeId}) REFERENCES ${
    TABLE.Judges
  }(${COLUMN.Judges.JudgeId})
    )
  `);
};

module.exports = {
  createAllTablesIfNotExist,
};

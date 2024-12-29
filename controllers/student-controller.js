const { studentFields } = require("../utilities/constant");
const {
  Students,
  Mentors,
  Projects,
  StudentProjectMapping,
} = require("../utilities/class-file");
const { v4: uuid } = require("uuid");
const {
  formatValue,
  getMajorCode,
  getFullName,
  splitNameNetworkId,
  getDepartmentCode,
  splitEmail,
  getCurrentSemester,
  splitSchoolCode,
} = require("../utilities/utils");

async function processStudentRecords(row) {
  // Get leader information
  let studentId = [];
  let leader = new Students(
    uuid(),
    getFullName(
      formatValue(row[studentFields.firstName], {
        datatype: "string",
        trim: true,
      }),
      formatValue(row[studentFields.lastName], {
        datatype: "string",
        trim: true,
      })
    ),
    formatValue(row[studentFields.networkId], {
      datatype: "string",
      trim: true,
    }),
    getMajorCode(
      formatValue(row[studentFields.participantMajor], {
        datatype: "string",
        trim: true,
      })
    ),
    splitSchoolCode(
      formatValue(row[studentFields.participantSchool], {
        datatype: "string",
        trim: true,
      })
    )
  );
  try {
    var leaderRecord = await leader.save();
    studentId.push(leaderRecord.StudentId);
  } catch (error) {
    console.error("Error saving leader:", error);
  }

  // add additional presenters
  let additionalPresentersCount = formatValue(
    row[studentFields.additionalPresentersCount],
    {
      datatype: "number",
    }
  );
  for (let i = 0; i < additionalPresentersCount; i++) {
    const presenterFields = studentFields.presenters[i];
    const { fullName, networkId } = splitNameNetworkId(
      formatValue(row[presenterFields.name], {
        datatype: "string",
        trim: true,
      })
    );
    if (fullName && networkId) {
      let student = new Students(
        uuid(),
        fullName,
        networkId,
        getMajorCode(
          formatValue(row[presenterFields.major], {
            datatype: "string",
            trim: true,
          })
        ),
        splitSchoolCode(
          formatValue(row[presenterFields.school], {
            datatype: "string",
            trim: true,
          })
        )
      );

      try {
        let studentRecord = await student.save();
        studentId.push(studentRecord.StudentId);
      } catch (error) {
        console.error(`Error saving additional presenter: ${networkId}`, error);
      }
    }
  }
  return studentId;
}
const processMentor = async (firstName, lastName, fields, row) => {
  let networkId = formatValue(row[fields.email], {
    datatype: "string",
    trim: true,
    toLowerCase: true,
  });
  if (firstName && lastName && networkId) {
    const mentor = new Mentors(
      uuid(),
      firstName,
      lastName,
      splitEmail(networkId),
      getDepartmentCode(
        formatValue(row[fields.department], {
          datatype: "string",
          trim: true,
        })
      ),
      splitSchoolCode(
        formatValue(row[fields.school], { datatype: "string", trim: true })
      )
    );

    try {
      let savedMentor = await mentor.save();
      return savedMentor.MentorId;
    } catch (error) {
      console.error("Error saving mentor:", error);
    }
  }
  return null;
};
async function processMentorRecords(row) {
  let mentorId = null,
    piId = null,
    capstoneMentorId = null;

  mentorId = await processMentor(
    formatValue(row[studentFields.mentor.firstName], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[studentFields.mentor.lastName], {
      datatype: "string",
      trim: true,
    }),
    studentFields.mentor,
    row
  );

  if (
    formatValue(row[studentFields.isCapstoneProject], { datatype: "boolean" })
  ) {
    capstoneMentorId = await processMentor(
      formatValue(row[studentFields.capstoneInstructor.firstName], {
        datatype: "string",
        trim: true,
      }),
      formatValue(row[studentFields.capstoneInstructor.lastName], {
        datatype: "string",
        trim: true,
      }),
      studentFields.capstoneInstructor,
      row
    );
  }
  let piFirstName = formatValue(
    row[studentFields.principalInvestigator.firstName],
    { datatype: "string", trim: true }
  );
  if (piFirstName != "" && piFirstName != null) {
    piId = await processMentor(
      piFirstName,
      formatValue(row[studentFields.principalInvestigator.lastName], {
        datatype: "string",
        trim: true,
      }),
      studentFields.principalInvestigator,
      row
    );
  }
  return { mentorId, capstoneMentorId, piId };
}

async function processProjectRecords(
  row,
  mentorId,
  capstoneMentorId,
  piId,
  leaderId
) {
  const title = formatValue(row[studentFields.projectTitle], {
    datatype: "string",
    trim: true,
  });

  const session = formatValue(row[studentFields.session], {
    datatype: "string",
    trim: true,
  });

  const boardSize = formatValue(row[studentFields.posterBoardSize], {
    datatype: "string",
    trim: true,
  });

  const needs = formatValue(row[studentFields.needTableOrChairs], {
    datatype: "string",
    trim: true,
  });

  const researchCategory = formatValue(row[studentFields.researchCategory], {
    datatype: "string",
    trim: true,
  });

  const project = new Projects(
    uuid(),
    title,
    mentorId,
    formatValue(row[studentFields.isCapstoneProject], { datatype: "boolean" }),
    capstoneMentorId,
    formatValue(row[studentFields.getJudged], { datatype: "boolean" }),
    session,
    boardSize,
    needs,
    formatValue(row[studentFields.keywords[0]], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[studentFields.keywords[1]], {
      datatype: "string",
      trim: true,
    }),
    formatValue(row[studentFields.keywords[2]], {
      datatype: "string",
      trim: true,
    }),
    leaderId,
    piId,
    researchCategory,
    formatValue(row[studentFields.posterNumber], { datatype: "string" })
  );

  try {
    let projectObject = await project.save();
    return projectObject;
  } catch (error) {
    console.error("Error saving project:", error);
    return null;
  }
}

async function processStuedntProjectMapping(studentIds, ProjectId) {
  let currentSemeseter = getCurrentSemester();
  let teamMapping = [];
  let studentProject = null;
  for (let studentId of studentIds) {
    studentProject = new StudentProjectMapping(
      studentId,
      ProjectId,
      currentSemeseter
    );
    teamMapping.push(studentProject);
  }
  try {
    await StudentProjectMapping.saveBulk(teamMapping);
  } catch (error) {
    console.error("Error saving student project mapping:", error);
  }
}

async function fromStudentRecord(studentData) {
  for (const row of studentData) {
    const studentIds = await processStudentRecords(row);
    const { mentorId, capstoneMentorId, piId } = await processMentorRecords(
      row
    );
    const project = await processProjectRecords(
      row,
      mentorId,
      capstoneMentorId,
      piId,
      studentIds[0]
    );
    await processStuedntProjectMapping(studentIds, project.ProjectId);
  }
}

module.exports = {
  fromStudentRecord,
  processMentor,
};

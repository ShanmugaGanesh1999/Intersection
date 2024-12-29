/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - networkId
 *         - majorCodes
 *         - school
 *         - preferredName
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the student
 *           example: 'John'
 *         lastName:
 *           type: string
 *           description: The last name of the student
 *           example: 'Doe'
 *         networkId:
 *           type: string
 *           description: The cwru network id of the student
 *           example: 'abc123'
 *         majorCodes:
 *           type: string
 *           description: The code of the majors of the student
 *           example: 'John'
 *         school:
 *           type: string
 *           description: The name of the school of the student
 *           example: 'Doe'
 *         preferredName:
 *           type: string
 *           description: The prefered name of the student
 *           example: 'abc123'
 *     Project:
 *       type: object
 *       required:
 *         - title
 *         - mentorId
 *         - isCapstone
 *         - capstoneMentorId
 *         - getJudged
 *         - session
 *         - boardSize
 *         - needs
 *         - keywords
 *         - leader
 *         - awardCategory1
 *         - awardCategory2
 *         - majorCode
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the project
 *           example: 'Heart Rate Monitor'
 *         mentorId:
 *           type: string
 *           description: The id of the mentor for the student
 *           example: '123456789'
 *         isCapstone:
 *           type: boolean
 *           description: The project is a capstone project
 *           example: 'True'
 *         capstoneMentorId:
 *           type: string
 *           description: If the project is a capstone project, the id of the mentor for the capstone project
 *           example: '987654321'
 *         getJudged:
 *           type: boolean
 *           description: Whether the project is getting judged
 *           example: 'True'
 *         session:
 *           type: string
 *           description: The session of the project presentation
 *           example: 'session 1'
 *           enum:
 *             - session 1
 *             - session 2
 *             - both
 *             - either
 *         boardSize:
 *           type: string
 *           description: The size of the board needed for the project presentation
 *           example: '32 * 40'
 *           enum:
 *             - 32 * 40
 *             - 40 * 60
 *         needs:
 *           type: string
 *           description: The needs of the project
 *           example: 'electricity'
 *           enum:
 *             - electricity
 *             - table
 *             - chair
 *         leader:
 *           type: string
 *           description: The foreign key of the leader of the project
 *           example: '123456789'
 *         awardCategory1:
 *           type: string
 *           description: The award category 1 of the project which they want to compete for
 *           example: 'Life Science'
 *           enum:
 *             - Arts & Humanities
 *             - Engineering
 *             - Life Science
 *             - Social Science
 *             - Physical Science
 *         awardCategory2:
 *           type: string
 *           description: The award category 2 of the project which they want to compete for
 *           example: 'Arts & Humanities'
 *           enum:
 *             - Arts & Humanities
 *             - Engineering
 *             - Life Science
 *             - Social Science
 *             - Physical Science
 *         majorCode:
 *           type: string
 *           description: The major which the project is done
 *           example: 'CSDS'
 *     Mentor:
 *       type: object
 *       required:
 *         - mentorId
 *         - firstName
 *         - lastName
 *         - networkId
 *         - majorCode
 *         - school
 *       properties:
 *         mentorId:
 *           type: string
 *           description: The id of the mentor
 *           example: 'a123456789'
 *         firstName:
 *           type: string
 *           description: The first name of the mentor
 *           example: 'John'
 *         lastName:
 *           type: string
 *           description: The last name of the mentor
 *           example: 'Doe'
 *         networkId:
 *           type: string
 *           description: The network id of the mentor
 *           example: 'abc123'
 *         majorCode:
 *           type: string
 *           description: The major code of the mentor
 *           example: 'csds'
 *         school:
 *           type: string
 *           description: The school of the mentor
 *           example: 'Eng'
 *     Judge:
 *       type: object
 *       required:
 *         - judgeId
 *         - firstName
 *         - lastName
 *         - networkId
 *         - majorCode
 *         - school
 *         - position
 *         - discipline
 *         - keyword
 *         - mentorId
 *     StudentProjectMapping:
 *       type: object
 *       required:
 *         - studentId
 *         - projectId
 *         - semester
 *       properties:
 *         studentId:
 *           type: string
 *           description: The id of the student that is in the project
 *         projectId:
 *           type: string
 *           description: The id of the project that the student is in
 *         semester:
 *           type: string
 *           description: The semester of the project
 *           example: 'Fall 2023'
 *     Major:
 *       type: object
 *       required:
 *         - majorCode
 *         - majorName
 *       properties:
 *         majorCode:
 *           type: string
 *           description: The code of the major
 *           example: 'CSDS'
 *         majorName:
 *           type: string
 *           description: The name of the major
 *           example: 'Computer Science and Data Science'
 *     School:
 *       type: object
 *       required:
 *         - schoolId
 *         - schoolName
 *       properties:
 *         schoolId:
 *           type: string
 *           description: The id of the school
 *         schoolName:
 *           type: string
 *           description: The name of the school
 *           example: 'CIA'
 *     JudgeProjectMapping:
 *       type: object
 *       required:
 *         - judgeId
 *         - projectId
 *         - semester
 *       properties:
 *         judgeId:
 *           type: string
 *           description: The id of the judge
 *         projectId:
 *           type: string
 *           description: The id of the project
 *         semester:
 *           type: string
 *           description: The semester of the project
 *           example: 'Fall 2023'
 *     JudgingScenario:
 *       type: object
 *       required:
 *         - judgeId
 *         - judgeOutside
 *         - count
 *         - session
 *         - semester
 *       properties:
 *         judgeId:
 *           type: string
 *           description: The id of the judge
 *         judgeOutside:
 *           type: boolean
 *           description: Whether to judge outside his expertise
 *           example: 'True'
 *         count:
 *           type: integer
 *           description: how many (approximately) presentations you are willing to judge.
 *         session:
 *           type: string
 *           description: The session of the project presentation
 *           example: 'session 1'
 *           enum:
 *             - session 1
 *             - session 2
 *             - both
 *             - either
 *         semester:
 *           type: string
 *           description: The semester of the project presentation
 *           example: 'Fall 2023'
 */

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description:
 * /upload:
 *   post:
 *     summary: Create the database with the csv from google sheet
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               student:
 *                 type: string
 *                 format: binary
 *               judge:
 *                 type: string
 *                 format: binary
 *             required:
 *               - student
 *               - judge
 *     responses:
 *       200:
 *         description: Successfully populated the database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       500:
 *         description: Some server error
 */
const express = require("express");

const router = express.Router();

const { upload } = require("../middlewares/file-upload");

const { readCSV, deleteFile } = require("../utilities/file-access");
const { fromStudentRecord } = require("../controllers/student-controller");
const { fromJudgeRecord } = require("../controllers/judges-controller");
router.post("/", upload, function (req, res) {
  const files = req.files;

  if (!(files && files.student && files.judge)) {
    res.status(400).json({
      message: "No file uploaded",
      status: 400,
    });
  }

  const studentFilePath = files.student[0].path;
  const judgeFilePath = files.judge[0].path;

  readCSV(studentFilePath)
    .then((studentData) => {
      fromStudentRecord(studentData);
    })
    .then(() => {
      readCSV(judgeFilePath)
        .then((judgeData) => {
          fromJudgeRecord(judgeData);
        })
        .then(() => {
          deleteFile(studentFilePath);
          deleteFile(judgeFilePath);
          res.status(200).json({
            message: "Successfully populated the database",
            status: 200,
          });
        });
    });
});

module.exports = router;

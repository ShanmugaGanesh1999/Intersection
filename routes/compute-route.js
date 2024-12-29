/**
 * @swagger
 * tags:
 *   name: Compute
 *   description:
 * /compute:
 *   post:
 *     summary: compute the intersection mapping between students and judges
 *     tags: [Compute]
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

const { computeMapping } = require("../controllers/compute-controller");

router.post("/", async (req, res) => {
  try {
    let { leftOverJudges, projects } = await computeMapping();
    let completelyDone = projects.filter(
        (project) => project.Judge1 && project.Judge2
      ),
      partiallyDone = projects.filter(
        (project) =>
          (project.Judge1 && !project.Judge2) ||
          (!project.Judge1 && project.Judge2)
      ),
      notDone = projects.filter(
        (project) => !project.Judge1 && !project.Judge2
      );
    res.status(200).json({
      message: "Successfully populated the database",
      stats: {
        leftOverJudges,
        "projects completely done": completelyDone.length,
        "projects partially done": partiallyDone.length,
        "projects not done": notDone.length,
        "projects partially done list": partiallyDone,
        "projects not done list": notDone,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: 400,
    });
  }
});

module.exports = router;

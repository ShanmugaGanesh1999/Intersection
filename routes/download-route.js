/**
 * @swagger
 * tags:
 *   name: Download
 *   description:
 * /download:
 *   post:
 *     summary: download the intersection mapping between students and judges
 *     tags: [Download]
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

const { downloadMapping } = require("../controllers/download-controller");

router.post("/", async (req, res) => {
  try {
    downloadMapping().then((filePath) => {
      res.download(filePath);
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: 400,
    });
  }
});

module.exports = router;

const fs = require("fs");
const path = require("path");
const fastcsv = require("fast-csv");
const { promisify } = require("util");

function readCSV(filePath) {
  const data = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(fastcsv.parse({ headers: true }))
      .on("error", (error) => reject(error))
      .on("data", (row) => data.push(row))
      .on("end", () => {
        resolve(data);
      });
  });
}

function writeCSV({ filePath, headers, data }) {
  return new Promise(async (resolve, reject) => {
    await deleteFile(filePath);
    const ws = fs.createWriteStream(filePath);
    fastcsv.write(data, { headers: headers }).pipe(ws);
    ws.on("error", (error) => reject(error));
    ws.on("finish", () => resolve(true));
  });
}

const unlinkAsync = promisify(fs.unlink);

async function deleteFile(path) {
  try {
    if (fs.existsSync(path)) {
      await unlinkAsync(path);
    }
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
  }
}

module.exports = {
  readCSV,
  deleteFile,
  writeCSV,
};

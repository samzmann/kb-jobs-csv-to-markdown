const fs = require('fs');
const axios = require('axios');
const parse = require('csv-parse').parse;

function writeOutputFile(outputFile, content) {
  fs.writeFile(outputFile, content, (err) => {
    if (err) {
      console.error('Error writing output file:', err);
      return;
    }
    console.log('Output file created:', outputFile);
  });
}

async function copyToClipboard(data) {
  try {
    const clipboardy = await (await import('clipboardy')).default;
    clipboardy.writeSync(data);
    console.log('Content copied to clipboard');
  } catch (error) {
    console.error('Error loading clipboardy:', error);
  }
}

function fetchAndParseCSV(csvUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(csvUrl);
      const csvData = response.data;

      parse(csvData, { columns: true}, (err, records) => {
        if (err) {
          console.error('Error parsing CSV data:', err);
          return;
        }

        resolve(records)
      });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      reject(error)
    }
  })
}

module.exports = {
  writeOutputFile,
  copyToClipboard,
  fetchAndParseCSV,
}

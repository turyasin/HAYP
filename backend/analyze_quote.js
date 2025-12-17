const XLSX = require('xlsx');
const path = require('path');

const resourcesDir = path.join(__dirname, '../resources');
const file = 'KayalarHas_HAYP_Draft Quote.xlsx';

console.log(`\n=== Analyzing: ${file} ===`);
const workbook = XLSX.readFile(path.join(resourcesDir, file));

// Just check the first sheet which is likely the template
const sheetName = workbook.SheetNames[0];
console.log(`--- Sheet: ${sheetName} ---`);
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (data.length > 0) {
    // Print first 20 rows to capture header and some data
    data.slice(0, 30).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
    });
}

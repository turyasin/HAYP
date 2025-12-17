const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const resourcesDir = path.join(__dirname, '../resources');
const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n=== Analyzing: ${file} ===`);
    const workbook = XLSX.readFile(path.join(resourcesDir, file));

    workbook.SheetNames.forEach(sheetName => {
        console.log(`--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get as array of arrays

        // Print first 5 rows to see structure
        if (data.length > 0) {
            data.slice(0, 15).forEach((row, index) => {
                console.log(`Row ${index}:`, row);
            });
        }
    });
});

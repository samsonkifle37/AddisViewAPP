const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lists/addisview_master_database_builder_pack.xlsx');

try {
    const workbook = xlsx.readFile(filePath);
    console.log("Sheet names:");
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log("Headers:");
            console.log(data[0]);
            if (data.length > 1) {
                console.log("First row:");
                console.log(data[1]);
            }
        } else {
            console.log("Sheet is empty.");
        }
    });

} catch (err) {
    console.error("Error reading xlsx file:", err);
}

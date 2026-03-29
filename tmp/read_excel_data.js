const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lists/addisview_master_database_builder_pack.xlsx');

try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets['verified_seed'];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(`Found ${data.length} records in verified_seed`);
    console.log(data.slice(0, 3));

    const toursSheet = workbook.Sheets['tour_packages'];
    const toursData = xlsx.utils.sheet_to_json(toursSheet);
    console.log(`Found ${toursData.length} records in tour_packages`);
    console.log(toursData.slice(0, 3));
} catch (err) {
    console.error("Error reading xlsx file:", err);
}

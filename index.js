#!/usr/bin/env node
import fs from 'fs'
import csv from 'csv-parser';

const fileToParse = process.argv[2];

function jsonToCsv(jsonData) {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return '';
  }

  // Generate header row using Object.entries on the first object
  const headers = Object.entries(jsonData[0]).map(([key]) => key);
  const headerRow = headers.join(',');

  // Generate data rows
  const dataRows = jsonData.map((obj) => {
    // Use Object.entries to extract the values in the same order as headers
    return headers
      .map((header) => {
        // We look up the value from the object by the header key
        const val = obj[header] ?? '';
        // Escape double quotes and commas if needed (simple example)
        return String(val).replace(/"/g, '""');
      })
      .join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

let results = [];

fs.createReadStream(fileToParse)
.pipe(csv())
.on('data', function(data){
    try {
      results.push(data)
    }
    catch(err) {
      console.error(err)
    }
})
.on('end',function(){
    const reversed = results.reverse();
    const negativeAmount = reversed.map(r => ({ ...r, inOut: r.Amount * -1 }));
    const final = negativeAmount.map(n =>({ Date: n['Clearance Date'], Description: n['Description'], PaidInOut: n.inOut }))

    fs.writeFileSync(`${new Date().toISOString()}-output.csv`, jsonToCsv(final));
});  

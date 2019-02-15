var fs = require('fs'),
    csv = require('csvtojson'),
    csvService = require('./csvService');

var inputPath = process.argv[2],
    outputPath = process.argv[3],
    apiBase = 'http://interview.wpengine.io/v1/accounts/',
    startTime = new Date().getTime();

if (!inputPath || !outputPath || !fs.existsSync(inputPath)) {
    console.log('Input and output filenames are required as arguments. Input file needs to exist.');
    console.log('e.g. ./wpe_merge input.csv output.csv');
    process.exit(1);
}

csv().fromFile(inputPath)
    .then(csvService.processCsv)
    .then((csvRecords) => {

        fs.writeFile(outputPath, csvService.getCsvOutput(csvRecords), (err) => {
            if (err) {
                console.log(`Error writing output file: ${err}`);
                process.exit(1);
            }
            var endTime = (new Date().getTime() - startTime) / 1000;
            console.log(`Took: ${endTime.toFixed(4)}s`);
        });
    });
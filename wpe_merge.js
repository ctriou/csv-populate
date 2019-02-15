var fs = require('fs'),
    csv = require('csvtojson'),
    axios = require('axios'),
    eol = require('os').EOL;

var inputPath = process.argv[2],
    outputPath = process.argv[3],
    apiBase = 'http://interview.wpengine.io/v1/accounts/',
    startTime = new Date().getTime();

if (!inputPath || !outputPath || !fs.existsSync(inputPath)) {
    console.log('Input and output filenames are required as arguments. Input file needs to exist.');
    console.log("e.g. ./wpe_merge input.csv output.csv");
    process.exit(1);
}

csv().fromFile(inputPath)
    .then(processCsv)
    .then(outputCsv)
    .then(() => {
        var endTime = (new Date().getTime() - startTime) / 1000;
        console.log(`Took: ${endTime.toFixed(4)}s`);
    });

function processCsv(csvRecords) {
    return axios.all(csvRecords.map((csvRecord, i) => 
        axios.get(`${apiBase}${csvRecord['Account ID']}`)
            .then(accountResponse => {

                var account = accountResponse.data;
                csvRecords[i] = {
                    'Account ID': csvRecord['Account ID'],
                    'First Name': csvRecord['First Name'],
                    'Created On': csvRecord['Created On'],
                    Status: account.status,
                    'Status Set On': account.created_on
                };
            })
    )).then(() => csvRecords);
}

function outputCsv(csvRecords) {
    var csvFile = fs.createWriteStream(outputPath),
        header = Object.keys(csvRecords[0]);

    csvFile.write(`${header.join()}${eol}`);
    csvRecords.forEach((csvRecord) => {
        csvFile.write(`${Object.values(csvRecord).join()}${eol}`);
    })

    csvFile.end();
}
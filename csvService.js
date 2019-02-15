var axios = require('axios'),
    eol = require('os').EOL;

var apiBase = 'http://interview.wpengine.io/v1/accounts/';

module.exports = {
    processCsv: function(csvRecords) {

        if (!csvRecords || !csvRecords.length) return;

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
    },
    getCsvOutput: function(csvRecords) {

        if (!csvRecords || !csvRecords.length) return;

        var output = '',
            header = Object.keys(csvRecords[0]);

        output += `${header.join()}${eol}`;
        csvRecords.forEach((csvRecord) => {
            output += `${Object.values(csvRecord).join()}${eol}`;
        })

        return output;
    }
}
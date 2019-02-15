var expect = require('chai').expect,
    axios = require('axios'),
    MockAdapter = require('axios-mock-adapter'),
    eol = require('os').EOL;

var csvService = require('../csvService'); 

describe('processCsv()', function () {

    var testInput = null,
        testOutput = null;

    beforeEach(function () {

        testInput = [
            {
                'Account ID': '12345',
                'First Name': 'Lex',
                'Created On': '1/12/11',
            },
            {
                'Account ID': '8172',
                'First Name': 'Victor',
                'Created On': '11/19/14',
            }
        ];
        testOutput = [
            {
                status: 'good',
                created_on: '11/19/22'
            },
            {
                status: 'bad',
                created_on: '11/19/22'
            },
        ];

        var mock = new MockAdapter(axios);
        mock.onGet(/accounts\/12345/i).reply(200, testOutput[0]);
        mock.onGet(/accounts\/8172/i).reply(200, testOutput[1]);
    });

    it('should return undefined if receives invalid arguments', function () {

        var undefinedResult = csvService.processCsv();
        var emptyResult = csvService.processCsv([]);

        expect(undefinedResult, 'Passing no arguments should result in undefined').to.be.undefined;
        expect(emptyResult, 'Passing an empty list should result in undefined').to.be.undefined;
    });

    it('should contain the same number of items in the response', async () => { 

        await csvService.processCsv(testInput);

        expect(testInput.length, 'Response should have two items').to.equal(2);
    });

    it('should keep items in the same order they were passed in', async () => { 

        await csvService.processCsv(testInput);

        expect(testInput[0]['Account ID'], 'First item should match first input account ID').to.equal('12345');
        expect(testInput[1]['Account ID'], 'Second item should match second input account ID').to.equal('8172');
    });

    it('should combine data from API', async () => { 

        await csvService.processCsv(testInput);

        expect(testInput[0].Status, 'Status should be defined from API').to.equal(testOutput[0].status);
        expect(testInput[1].Status, 'Second item should match second input account ID').to.equal(testOutput[1].status);
    });
});

describe('getCsvOutput()', function () {

    var testData = null;

    beforeEach(function () {

        testData = [
            {
                random: 'data for first column in header',
                'Nuance Ping': 'really?',
            },
            {
                random: 'something random',
                'Nuance Ping': 'npm install',
            }
        ]
    });

    it('should return undefined if receives invalid arguments', function () {

        var undefinedResult = csvService.getCsvOutput();
        var emptyResult = csvService.getCsvOutput([]);

        expect(undefinedResult, 'Passing no arguments should result in undefined').to.be.undefined;
        expect(emptyResult, 'Passing an empty list should result in undefined').to.be.undefined;
    });

    it('should contain our header', function () {

        var output = csvService.getCsvOutput(testData),
            headerPresent = new RegExp(Object.keys(testData[0]).join(), 'i').test(output);

        expect(headerPresent, 'Header not found').to.be.true;
    });

    it('should have 3 rows', function () {

        var output = csvService.getCsvOutput(testData),
            rows = output.match(new RegExp(eol, 'm') || []).length;

        expect(3, 'There should be 3 rows, 1 header and two data rows').to.equal(3);
    });
});
const fs = require('fs');
const {parse} = require('csv-parse');
const path = require('path');
const createCSV = require('csv-writer').createObjectCsvWriter;

const csvFilePath = path.join(__dirname, './csv');

// console.log(csvFilePath);

fs.readdir(csvFilePath,async (err, files) => {
    if(err) return console.log(err);
    let dataR715 =[];
    let dataD701 = [];
    let countTotal = files.length;
    let count = 0;
    await files.forEach(async (file) => {
       await fs.readFile(csvFilePath + '/' + file, 'utf8', async (err, data) => {
            if(err) return console.log(err);
            
            await parse(data, {delimiter: ',', fromLine: 5},async (err, output) => {
                if(err) return console.log(err);
                // console.log(output);
                count++;
                const components = await output.map(item => {
                    return {
                        NO: item[1].trim(),
                        MODE: item[2].trim(),
                        DEVICE: item[3].trim(),
                        ACTUAL: item[4].trim(), 
                        REFER: item[5].trim(),
                        MEASURE: splitString(item[6]),
                        LIMIT_DOWN: item[7].trim(),
                        PRESENT_DOWN: item[8].trim(),
                        LIMIT_UP: item[9].trim(),
                        PRESENT_UP: item[10].trim(),
                        FILENAME: file
                    }});
                    
                const R715 = findComponent(components,"R715");
                const D701 = findComponent(components,"D701");

                dataR715.push(R715[0]);
                dataD701.push(D701[0]);
               if(count === countTotal){
                await WriteCsv(dataR715,"R715");
                await WriteCsv(dataD701,"D701");
               }
            });
        });
    })
});

const findComponent = (arr,name) => {
    const result = arr.filter(item => item.DEVICE === name);
    if(!result.length) return '';
   return result;
}
const splitString = (str,separator=" ") => {
    const string = str.trim();
    return string.split(separator)[0];
}

const WriteCsv = async (data,nameFile = "result") => {
    const csvWriter = createCSV({
        path: './'+nameFile+'.csv',
        header: [
            {id: 'NO', title: 'NO'},
            {id: 'MODE', title: 'MODE'},
            {id: 'DEVICE', title: 'DEVICE'},
            {id: 'ACTUAL', title: 'ACTUAL'},
            {id: 'REFER', title: 'REFER'},
            {id: 'MEASURE', title: 'MEASURE'},
            {id: 'LIMIT_DOWN', title: 'LIMIT_DOWN'},
            {id: 'PRESENT_DOWN', title: 'PRESENT_DOWN'},
            {id: 'LIMIT_UP', title: 'LIMIT_UP'},
            {id: 'PRESENT_UP', title: 'PRESENT_UP'},
            {id: 'FILENAME', title: 'FILENAME'}
        ]
    });
    await csvWriter.writeRecords(data);
    console.log("Write CSV Success");
}
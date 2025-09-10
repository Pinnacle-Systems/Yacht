import moment from "moment";
import { utils, writeFile } from "xlsx-js-style"

export const exportFileToCsv = (company, excelData, fileName, companyName) => {

    const ws = utils.json_to_sheet([[company], [fileName], ...excelData]);
    const wb = utils.book_new();

    utils.book_append_sheet(wb, ws, "Sheet1");
    let cells = cellsInRange(ws["!ref"]);
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        if (!ws[cell]) continue
        if (getNumericFromString(cell) == 1) {
            ws[cell]['s'] = { font: { bold: true }, fill: { fgColor: { rgb: "F3F4F6" } } };

        }
        else {
            let isEven = getNumericFromString(cell) % 2 == 0;
            if (isEven) {
                ws[cell]['s'] = { fill: { fgColor: { rgb: "D1D5DE" } } };
            } else {
                ws[cell]['s'] = { fill: { fgColor: { rgb: "F9FAFB" } } };
            }
        }
    }
    writeFile(wb, `${fileName} ${moment(new Date()).format("hh-mm A DD-MM-YYYY")}.xlsx`);

};

const getAlphabetsFromString = (s) => s.replace(/[^a-zA-Z]/g, '');
const getNumericFromString = (s) => parseInt(s.match(/\d+/), 10);


var cellsInRange = function (s) {
    let sArr = s.split(":");
    let startCharCode = getAlphabetsFromString(sArr[0]).charCodeAt();
    let startNumber = getNumericFromString(sArr[0]);
    let endCharCode = getAlphabetsFromString(sArr[1]).charCodeAt();
    let endNumber = getNumericFromString(sArr[1]);
    let output = [];
    for (let i = startCharCode; i <= endCharCode; i++) {
        for (let j = startNumber; j <= endNumber; j++) {
            output.push(`${String.fromCharCode(i)}${j}`)
        }
    }
    return output;
};


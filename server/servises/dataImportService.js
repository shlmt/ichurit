const mongoose = require('mongoose')
const xlsx = require('xlsx')
const Student = require('../models/Student')
const Class = require('../models/Class')

async function importDataFromExcel(workbook,req) {
    try {
        console.log("req"+req);
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        let errors = ""
        const jsonData = xlsx.utils.sheet_to_json(worksheet)
        let numLine = 1;
        for (const data of jsonData) {
            numLine++
            if (data.idNum.toString().length != 9) {
                console.error('Invalid id number')
                errors+=numLine+","
                continue
            }
            const classData = await Class.findOne({ grade: data.grade, number: data.number,user:req.user._id })
            console.log(data.grade,data);
            if (!classData) {
                console.error('Class not found for:', data);
                errors+=numLine+","
                continue
            }
            try {
                if(!data.idNum || !data.name){
                    errors+=numLine+","
                    continue
                }
                const dup = await Student.findOne({name:data.name,class1:classData._id,user:req.user._id}).lean()
                if(dup){
                    errors+=numLine+","
                    continue
                }
                const student = new Student({
                    idNum: data.idNum,
                    name: data.name,
                    class1: classData._id,
                    comment:"",
                    user:req.user._id
                })
                await student.save();
                console.log('Data saved:', data);
            } catch (error) {
                console.error('Error saving student data:', error);
                errors+=numLine+","
                continue
            }
        }
        console.log('Data import completed.')
        return errors
    }
    catch (error) {
        console.error('Error importing data:', error);
    }
}

module.exports = { importDataFromExcel }
import mongoose from 'mongoose';

const Employeeschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    }
})

const EmployeeModel = mongoose.model('employees', Employeeschema)
export default EmployeeModel;
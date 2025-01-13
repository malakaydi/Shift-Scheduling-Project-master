const mongoose = require('mongoose');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Employee = require('./Models/employeeModel');

// Load proto definition for employees
const employeeProtoPath = 'employee.proto';
const employeeProtoDefinition = protoLoader.loadSync(employeeProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const employeeProto = grpc.loadPackageDefinition(employeeProtoDefinition).employee;

// Connect to MongoDB
const url = process.env.MONGODB_URL || 'mongodb://mongodb:27017/employeesDB';
mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch((err) => {
        console.log(err);
    });

// Define gRPC methods for employee service
const employeeService = {
    getEmployee: async (call, callback) => {
        try {
            const employeeId = call.request.employee_id;
            const employee = await Employee.findById(employeeId).exec();

            if (!employee) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Employee not found' });
                return;
            }
            callback(null, { employee });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching employee' });
        }
    },
    searchEmployees: async (call, callback) => {
        try {
          //  const query = call.request.query;
            const employees = await Employee.find({ }).exec();
            callback(null, { employees });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while searching employees' });
        }
    },
    addEmployee: async (call, callback) => {
        try {
            const { firstName, lastName, phoneNumber, email, position } = call.request;
            const newEmployee = new Employee({ firstName, lastName, phoneNumber, email, position });
            const savedEmployee = await newEmployee.save();
            callback(null, { employee: savedEmployee });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding employee' });
        }
    },

    deleteEmployee: async (call, callback) => {
        try {
            const employeeId = call.request.employee_id;
            const deletedEmployee = await Employee.findByIdAndDelete(employeeId).exec();

            if (!deletedEmployee) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Employee not found' });
                return;
            }
            callback(null, { message: 'Employee deleted successfully' });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while deleting employee' });
        }
    }
};

// Create gRPC server for employee service
const server = new grpc.Server();
server.addService(employeeProto.EmployeeService.service, employeeService);
const port = 50053;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind server:', err);
        return;
    }
    console.log(`Employee microservice is running on port ${port}`);
    server.start();
});

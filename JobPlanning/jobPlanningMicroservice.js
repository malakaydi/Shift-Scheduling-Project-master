// jobPlanningMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const JobPlanning = require('./Models/jobPlanningModel');

const jobPlanningProtoPath = 'jobPlanning.proto';
const jobPlanningProtoDefinition = protoLoader.loadSync(jobPlanningProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const jobPlanningProto = grpc.loadPackageDefinition(jobPlanningProtoDefinition).jobPlanning;
const url = process.env.MONGODB_URL || 'mongodb://mongodb:27017/jobPlanningDB';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch((err) => {
        console.log(err);
    });

const jobPlanningService = {
    getJobPlanning: async (call, callback) => {
        try {
            const jobPlanningId = call.request.job_planning_id;
            const jobPlanning = await JobPlanning.findOne({ _id: jobPlanningId }).exec();

            if (!jobPlanning) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Job planning not found' });
                return;
            }
            callback(null, { job_planning:jobPlanning });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching job planning' });
        }
    },
    searchJobPlannings: async (call, callback) => {
        try {
            const jobPlannings = await JobPlanning.find({}).exec();
            console.log(jobPlannings);
            callback(null, { job_plannings:jobPlannings });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching job plannings' });
        }
    },
    addJobPlanning: async (call, callback) => {
        const { employee_name,position, startDate, endDate } = call.request;
       // console.log(call.request);
        const newJobPlanning = new JobPlanning({ employee_name,position, startDate, endDate });

        try {
            const savedJobPlanning = await newJobPlanning.save();
            callback(null, { job_planning: savedJobPlanning });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding job planning' });
        }
    },


    deleteJobPlanning: async (call, callback) => {
        try {
            const jobPlanningId = call.request.job_planning_id;
            const deletedJobPlanning = await JobPlanning.findOneAndDelete({ _id: jobPlanningId }).exec();

            if (!deletedJobPlanning) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Job planning not found' });
                return;
            }
            
            callback(null, { message: 'Job planning deleted successfully' });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while deleting job planning' });
        }
    },
};

const server = new grpc.Server();
server.addService(jobPlanningProto.JobPlanningService.service, jobPlanningService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Job planning microservice is running on port ${port}`);

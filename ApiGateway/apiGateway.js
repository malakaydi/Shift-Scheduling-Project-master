const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka, Partitioners } = require('kafkajs'); // Import Partitioners
const path = require('path');

const app = express();

// Kafka configuration with better retry settings
const kafka = new Kafka({
    clientId: 'api-gateway',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    retry: {
        initialRetryTime: 1000,
        retries: 10,
        maxRetryTime: 30000,
        factor: 2
    },
    connectionTimeout: 3000
});

// Create producer with legacy partitioner
const producer = kafka.producer({
    allowAutoTopicCreation: true,
    createPartitioner: Partitioners.LegacyPartitioner
});

const consumer = kafka.consumer({ 
    groupId: 'api-gateway-consumer',
    maxWaitTimeInMs: 50,
    maxBytes: 5242880
});

// Function to connect to Kafka with retries
async function connectWithRetry(maxRetries = 10, delay = 5000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await producer.connect();
            await consumer.connect();
            console.log('Successfully connected to Kafka');
            return true;
        } catch (err) {
            console.error(`Failed to connect to Kafka (attempt ${i + 1}/${maxRetries}):`, err);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.warn('Failed to connect to Kafka, continuing without Kafka functionality');
    return false;
}

// Initialize Kafka
(async () => {
    try {
        const isConnected = await connectWithRetry();
        if (isConnected) {
            await consumer.subscribe({ 
                topics: ['employee-topic', 'job-planning-topic', 'alerte-msg-topic'],
                fromBeginning: true
            });
            
            await consumer.run({
                autoCommit: true,
                eachMessage: async ({ topic, partition, message }) => {
                    console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
                }
            });
        }
    } catch (error) {
        console.error('Failed to initialize Kafka:', error);
    }
})();

// Update proto file paths and load them
const employeeProtoPath = path.join(__dirname, 'protos', 'employee.proto');
const jobPlanningProtoPath = path.join(__dirname, 'protos', 'jobPlanning.proto');
const alerteMsgProtoPath = path.join(__dirname, 'protos', 'alerteMsg.proto');

const protoOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

const employeeProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(employeeProtoPath, protoOptions)
).employee;

const jobPlanningProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(jobPlanningProtoPath, protoOptions)
).jobPlanning;

const alerteMsgProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(alerteMsgProtoPath, protoOptions)
).alerteMsg;

// Create gRPC clients
const employeeClient = new employeeProto.EmployeeService(
    'employee:50053',
    grpc.credentials.createInsecure()
);

const jobPlanningClient = new jobPlanningProto.JobPlanningService(
    'jobplanning:50052',
    grpc.credentials.createInsecure()
);

const alerteMsgClient = new alerteMsgProto.AlerteMsgService(
    'alertes:50055',
    grpc.credentials.createInsecure()
);

// Initialize Express middleware
app.use(bodyParser.json());
app.use(cors());

// Employee endpoints
app.get('/employee', (req, res) => {
    employeeClient.searchEmployees({}, (err, response) => {
        if (err) {
            console.error('Error in searchEmployees:', err);
            res.status(500).send(err);
        } else {
            res.json(response.employees);
        }
    });
});

app.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    employeeClient.getEmployee({ employee_id: id }, (err, response) => {
        if (err) {
            console.error('Error in getEmployee:', err);
            res.status(500).send(err);
        } else {
            res.json(response.employee);
        }
    });
});

app.post('/employee/add', (req, res) => {
    const { firstName, lastName, phoneNumber, email, position } = req.body;
    employeeClient.addEmployee({ 
        firstName, 
        lastName, 
        phoneNumber, 
        email, 
        position 
    }, (err, response) => {
        if (err) {
            console.error('Error in addEmployee:', err);
            res.status(500).send(err);
        } else {
            res.json(response.employee);
        }
    });
});

app.delete('/employee/:id', (req, res) => {
    const id = req.params.id;
    employeeClient.deleteEmployee({ employee_id: id }, (err, response) => {
        if (err) {
            console.error('Error in deleteEmployee:', err);
            res.status(500).send(err);
        } else {
            res.json({ message: 'Employee deleted successfully' });
        }
    });
});

// Job Planning endpoints
app.get('/jobPlanning', (req, res) => {
    jobPlanningClient.searchJobPlannings({}, (err, response) => {
        if (err) {
            console.error('Error in searchJobPlannings:', err);
            res.status(500).send(err);
        } else {
            res.json(response.job_plannings);
        }
    });
});

app.get('/jobPlanning/:id', (req, res) => {
    const id = req.params.id;
    jobPlanningClient.getJobPlanning({ job_planning_id: id }, (err, response) => {
        if (err) {
            console.error('Error in getJobPlanning:', err);
            res.status(500).send(err);
        } else {
            res.json(response.job_planning);
        }
    });
});

app.post('/jobPlanning/add', (req, res) => {
    const { employee_name, position, startDate, endDate } = req.body;
    jobPlanningClient.addJobPlanning({ 
        employee_name,
        position, 
        startDate, 
        endDate
    }, (err, response) => {
        if (err) {
            console.error('Error in addJobPlanning:', err);
            res.status(500).send(err);
        } else {
            res.json(response.job_planning);
        }
    });
});

app.delete('/jobPlanning/:id', (req, res) => {
    const id = req.params.id;
    jobPlanningClient.deleteJobPlanning({ job_planning_id: id }, (err, response) => {
        if (err) {
            console.error('Error in deleteJobPlanning:', err);
            res.status(500).send(err);
        } else {
            res.json({ message: 'Job planning deleted successfully' });
        }
    });
});

// Alerte endpoints
app.post('/alerteMsg/send', (req, res) => {
    const { recipient, message } = req.body;
    alerteMsgClient.sendAlerteMsg({ 
        recipient, 
        message 
    }, (err, response) => {
        if (err) {
            console.error('Error in sendAlerteMsg:', err);
            res.status(500).send(err);
        } else {
            res.json(response.confirmation);
        }
    });
});

app.put('/alerteMsg/update/:id', (req, res) => {
    const { id } = req.params;
    const { message, recipient } = req.body;
    alerteMsgClient.updateAlerteMsg({ 
        id, 
        message, 
        recipient 
    }, (err, response) => {
        if (err) {
            console.error('Error in updateAlerteMsg:', err);
            res.status(500).send(err);
        } else {
            res.json({ confirmation: response.confirmation || "Alert message updated successfully" });
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
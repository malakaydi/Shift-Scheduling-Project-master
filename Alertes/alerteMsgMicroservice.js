const mongoose = require('mongoose');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');
const AlerteMsg = require('./Models/alerteMsgModel');

// Load proto definition for alerteMsg
const alerteMsgProtoPath = 'alerteMsg.proto';
const alerteMsgProtoDefinition = protoLoader.loadSync(alerteMsgProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const alerteMsgProto = grpc.loadPackageDefinition(alerteMsgProtoDefinition);

// Connect to MongoDB
const url = process.env.MONGODB_URL || 'mongodb://mongodb:27017/alerteMsgsDB';
mongoose.connect(url)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Initialize Kafka producer
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();

// Define gRPC methods for alerteMsg service
const alerteMsgService = {
    sendAlerteMsg: async (call, callback) => {
        const { recipient, message } = call.request;
        const newAlerteMsg = new AlerteMsg({ recipient, message });

        try {
            // Save alert message to MongoDB
            const savedAlerteMsg = await newAlerteMsg.save();

            // Send message to Kafka
            await producer.connect();
            await producer.send({
                topic: 'alerte-msg-topic',
                messages: [
                    { value: JSON.stringify(savedAlerteMsg) }
                ],
            });
            console.log("Message send to alerte-msg-topic! ");
            await producer.disconnect();

            callback(null, { confirmation: 'Alert message sent successfully' });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while sending alert message' });
        }
    },

    updateAlerteMsg: async (call, callback) => {
        const { id, message, recipient } = call.request;
        try {
            // Find the alerte message by id
            const existingAlerteMsg = await AlerteMsg.findById(id);

            if (!existingAlerteMsg) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Alert message not found' });
                return;
            }

            // Update the alerte message
            existingAlerteMsg.message = message;
            existingAlerteMsg.recipient = recipient;

            // Save the updated alerte message
            const updatedAlerteMsg = await existingAlerteMsg.save();

            callback(null, { confirmation: 'Alert message updated successfully' });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while updating alert message' });
        }
    },
    
};

// Create gRPC server for alerteMsg service
const server = new grpc.Server();
server.addService(
    alerteMsgProto.alerteMsg.AlerteMsgService.service,
    {
        sendAlerteMsg: alerteMsgService.sendAlerteMsg,
        updateAlerteMsg: alerteMsgService.updateAlerteMsg,
    }
);
const port = 50055;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('Failed to bind server:', err);
        return;
    }
    console.log(`AlerteMsg microservice is running on port ${port}`);

    // Start the server
    server.start();
});

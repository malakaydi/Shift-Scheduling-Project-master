
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


// Update proto file paths
const employeeProtoPath = path.join(__dirname, 'protos', 'employee.proto');
const jobPlanningProtoPath = path.join(__dirname, 'protos', 'jobPlanning.proto');
const alerteMsgProtoPath = path.join(__dirname, 'protos', 'alerteMsg.proto');
const employeeProtoDefinition = protoLoader.loadSync(employeeProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const jobPlanningProtoDefinition = protoLoader.loadSync(jobPlanningProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const alerteMsgProtoDefinition = protoLoader.loadSync(alerteMsgProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const employeeProto = grpc.loadPackageDefinition(employeeProtoDefinition).employee;
const jobPlanningProto = grpc.loadPackageDefinition(jobPlanningProtoDefinition).jobPlanning;
const alerteMsgProto = grpc.loadPackageDefinition(alerteMsgProtoDefinition).alerteMsg;

const resolvers = {
    Query: {
        employee: (_, { id }) => {
            
            const client = new employeeProto.EmployeeService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getEmployee({ employee_id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.employee);
                    }
                });
            });
        },
        
        employees: () => {
           
            const client = new employeeProto.EmployeeService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchEmployees({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.employees);
                    }
                });
            });
        },


//**************************************************************************** */


jobPlanning: (_, { id }) => {
   
    const client = new jobPlanningProto.JobPlanningService('localhost:50052',
        grpc.credentials.createInsecure());
    return new Promise((resolve, reject) => {
        client.getJobPlanning({ job_planning_id: id }, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response.job_planning);
            }
        });
    });
},


       
        
        jobPlannings: () => {
           
            const client = new jobPlanningProto.JobPlanningService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchJobPlannings({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.job_plannings);
                    }
                });
            });
        },


//**************************************************************************** */




},
Mutation: {


    AddEmployee: (_, { firstName, lastName, phoneNumber, email, position }) => {
        const client = new employeeProto.EmployeeService('localhost:50053', grpc.credentials.createInsecure());
        return new Promise((resolve, reject) => {
          client.addEmployee({ firstName, lastName, phoneNumber, email, position }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              
              resolve({ message: response.message || "Employee added successfully" });
            }
          });
        });
      },

      DeleteEmployee: (_, { id }) => {
        const client = new employeeProto.EmployeeService('localhost:50053', grpc.credentials.createInsecure());
        return new Promise((resolve, reject) => {
          client.deleteEmployee({ employee_id: id }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve({ message: response.message || "Employee deleted successfully" });
            }
          });
        });
      },
      

    
AddJobPlanning: (_, { employee_name,position,startDate, endDate}) => {
           
            const client = new jobPlanningProto.JobPlanningService('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.AddJobPlanning({ employee_name:employee_name,position: position,startDate:startDate, endDate:endDate}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({msg:response.msg|| "Job Planning added successfully"});
                    }
                });
            });
        },


        DeleteJobPlanning: (_, { id }) => {
            const client = new jobPlanningProto.JobPlanningService(
              'localhost:50052',
              grpc.credentials.createInsecure()
            );
            return new Promise((resolve, reject) => {
              client.DeleteJobPlanning({ job_planning_id: id }, (err, response) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({ message: response.message || "Job planning deleted successfully" });
                }
              });
            });
          },



    sendAlerteMsg: async (_, { message, recipient }) => {
        const client = new alerteMsgProto.AlerteMsgService('localhost:50055',
            grpc.credentials.createInsecure());
        return new Promise((resolve, reject) => {
            client.sendAlerteMsg({ message, recipient }, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ confirmation: response.confirmation || "Message send successfully"});
                }
            });
        });
    },

    UpdateAlerteMsg: (_, { id, message, recipient }) => {
        const client = new alerteMsgProto.AlerteMsgService(
            'localhost:50055',
            grpc.credentials.createInsecure()
        );
        return new Promise((resolve, reject) => {
            client.UpdateAlerteMsg({ id, message, recipient }, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ confirmation: response.confirmation || "Alert message updated successfully" });
                }
            });
        });
    },





}
};

module.exports = resolvers;
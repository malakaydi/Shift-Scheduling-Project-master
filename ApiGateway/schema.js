const { gql } = require('@apollo/server');


const typeDefs = `#graphql
  type Employee {
    id: String!
    firstName: String!
    lastName: String!
    phoneNumber: Int!
    email: String!
    position: String!
  }

  type JobPlanning {
    employee_name: String!
    position: String!
    startDate: String!
    endDate: String!
  }

  type AlerteMsg {
    message: String!
    recipient: String!
  }

  



  type Query {
    employee(id: String!): Employee
    employees: [Employee]
    jobPlanning(id: String!): JobPlanning
    jobPlannings: [JobPlanning]
    
  }


  type Mutation {
    AddJobPlanning(
      employee_name: String!
      position: String!
      startDate: String!
      endDate: String!
  ): PlanningResponse!
  DeleteJobPlanning(id: String!): DeleteResponse!
}

type DeleteResponse {
  message: String!
}

type PlanningResponse {
  msg: String!
  }

  type Mutation {
    AddEmployee(
    firstName: String!
    lastName: String!
    phoneNumber: Int!
    email: String!
    position: String!
  ): EmployeeResponse!

  DeleteEmployee(
    id: String!
  ): DeleteResponse!
  
}

type EmployeeResponse {
  message: String!
}

type DeleteResponse {
  message: String!
}

type EmployeeResponse {
  message: String!
  }


  type Mutation {
    sendAlerteMsg(message: String!, recipient: String!): ConfirmationResponse!
  }

  type ConfirmationResponse {
    confirmation: String!
  }

  type Mutation {

    UpdateAlerteMsg(
        id: String!
        message: String!
        recipient: String!
    ): UpdateAlerteMsgResponse!
}

type UpdateAlerteMsgResponse {
    confirmation: String!
}
  
`;
module.exports = typeDefs
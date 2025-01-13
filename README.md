# Shift Scheduling Project 🏥👩‍⚕️

In the dynamic and fast-paced environment of hospitals, efficient planning is paramount, especially when it comes to scheduling staff for various shifts. **Shift Schedule Microservice** offers a robust solution tailored to the unique challenges faced by healthcare institutions. Designed with Node.js, gRPC, GraphQL, and REST, and enhanced with Kafka for seamless communication, this microservices-based application empowers hospitals to streamline their scheduling processes effectively. It consists of three microservices: Employee, JobPlanning, and AlerteMsg.

This README file provides an overview of the project and other relevant information.

![Shift Scheduling Project Overview](/archii.png)

## Features
- **Microservices architecture** with gRPC, GraphQL, REST, and Kafka
- **CRUD operations** for Employee, JobPlanning, and AlerteMsg microservices
- **Communication** between services using gRPC and RESTful APIs
- **GraphQL endpoint** for flexible querying and data manipulation
- **Kafka** for message queuing and asynchronous communication between services
- **MongoDB** as the database for storing data.

## Technologies
- Node.js
- gRPC
- GraphQL
- RESTful APIs
- MongoDB
- Kafka

## Getting Started

### Prerequisites
- Node.js (version 16.14.0)
- npm (version 8.5.2)
- MongoDB (version 5.1.6)
- GraphQL (version 16.6.0)

### Installation
1. Clone the repository: https://github.com/malakaydi/Shift-Scheduling-Project.git
2. Install the dependencies using npm:
   ```bash
   npm install

## Usage
### Start the Microservices
Start all microservices and the gateway in this order:
#### Employee Microservice
```bash
cd Employee
nodemon employeeMicroservice.js
```
#### Job Planning Microservice
```bash
cd JobPlanning
nodemon jobPlanningMicroservice.js
```
#### Alertes Microservice
```bash
cd Alertes
nodemon alerteMsgMicroservice.js
```
#### ApiGateway
```bash
cd apiGateway
nodemon apiGateway.js
```
The microservices should now be running, and you can access them using the provided endpoints.

### Start Zookeeper and Kafka Server
To start Zookeeper, navigate to the Kafka installation directory and run the following command in a terminal or command prompt:
```bash
./bin/windows/zookeeper-server-start.bat config/zookeeper.properties
```
After starting Zookeeper, you can start the Kafka server by running the following command in a separate terminal or command prompt window:
```bash
./bin/windows/kafka-server-start.bat config/server.properties
```
## Running Services
- **Employee Service:** Runs on port '50053'
- **AlerteMsg Service:** Runs on port '50055'
- **Job Planning Service:** Runs on port 50052
- **MongoDB:** Runs on port 27017
- **Kafka:** Runs on port 9092
- **API Gateway:** Runs on port 3000

## Testing
- To test the REST endpoints, use Thunder Client or Postman.
- To test using GraphQL, use Apollo Server with the URL: http://localhost:3000/

## API Endpoints
### Employee Service
- **GET /employee:** Retrieves all employees from the database.
- **GET /employee/:id:** Retrieves a specific employee by its ID.
- **POST /employee/add:** Creates a new employee in the database.
- **DELETE /employee/:id:** Deletes a specific employee by its ID.

### Job Planning Service
- **GET /jobPlanning:** Retrieves all job plannings from the database.
- **GET /jobPlanning/:id:** Retrieves a specific job planning by its ID.
- **POST /jobPlanning/add:** Creates a new job planning in the database.
- **DELETE /jobPlanning/:id:** Deletes a specific job planning by its ID.

### AlerteMsg Service
- **POST /alerteMsg/send:** Sends an alert message to a recipient.
- **PUT /alerteMsg/update/:id:** Updates a specific alert message by its ID.

## Database
The project uses MongoDB as the database system. You can set up MongoDB locally or use a cloud-based MongoDB service. Make sure to update the database connection configuration in the project files accordingly.

# DevOps Infrastructure Documentation
## Table of Contents
- [Docker Configuration](#docker-configuration)
- [Jenkins Integration](#Jenkins-integration)
- [Kubernetes Setup](#kubernetes-setup)
- [Helm Charts](#helm-charts)
- [ArgoCD Configuration](#argocd-configuration)
- [CI/CD Pipeline](#cicd-pipeline)

## Docker Configuration
### Dockerfile for Services
Each microservice has its own Dockerfile for containerization. These Dockerfiles define the environment and dependencies required for the services to run.
### Docker-Compose 
A docker-compose.yml file orchestrates the startup of all microservices, MongoDB, and Kafka, ensuring seamless interaction between containers.

## Jenkins Integration
Jenkins is configured to streamline the CI/CD process by automating builds, tests, and deployments.
**Pipeline Configuration:** Jenkinsfile scripts define multi-stage pipelines, including build, test, and deployment stages.
**Integration with Kubernetes:** Jenkins integrates with Kubernetes to dynamically allocate build agents and manage deployments.
**Notification System:** Jenkins is configured to send notifications on build or deployment status via Slack or email.

## Kubernetes Setup
The Kubernetes setup is organized into the following directories:
Kubernetes/
├── configmap.yaml
│── kafka.yaml  
|── microservices.yaml
|── mongodb.yaml
|── namespace.yaml

## Helm Charts
Helm charts are provided for deploying the application in a Kubernetes cluster. The directory structure is as follows:
helm/
├── shift-scheduling/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── api-gateway.yaml
│       ├── deployment.yaml

**Chart.yaml:** Metadata about the Helm chart.
**values.yaml:** Default configuration values for the chart.
**Templates Directory:** Contains Kubernetes resource templates for deployments, services, config maps, and secrets.

## ArgoCD Configuration
ArgoCD is configured to automate the deployment of the Kubernetes manifests. It monitors the Git repository and applies changes automatically to the cluster.
**Applications:** ArgoCD applications are defined to manage microservices.
**Sync Policy:** Configured for automated syncing and rollback in case of failures.

## CI/CD Pipeline
A robust CI/CD pipeline automates the following stages:

**1. Build:** Docker images for all microservices are built and tagged.
**2. Test:** Automated tests are executed to ensure code quality and functionality.
**3. Deploy:** Images are pushed to a container registry, and Kubernetes manifests are applied to the cluster.
**4. Monitor:** Deployment success is monitored, with alerts configured for failures.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please submit an issue or a pull request. For major changes, please open an issue first to discuss potential changes.

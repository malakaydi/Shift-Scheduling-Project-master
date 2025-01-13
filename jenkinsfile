pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        VERSION = '1.0.0'
        IMAGE_NAME_API_GATEWAY = 'malouaidi/api-gateway'
        IMAGE_NAME_EMPLOYEE = 'malouaidi/employee'
        IMAGE_NAME_JOB_PLANNING = 'malouaidi/jobplanning'
        IMAGE_NAME_ALERTES = 'malouaidi/alertes'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build API Gateway Image') {
                    steps {
                        dir('ApiGateway') {
                            script {
                                dockerImageApiGateway = docker.build("${IMAGE_NAME_API_GATEWAY}:${VERSION}")
                            }
                        }
                    }
                }
                stage('Build Employee Service Image') {
                    steps {
                        dir('Employee') {
                            script {
                                dockerImageEmployee = docker.build("${IMAGE_NAME_EMPLOYEE}:${VERSION}")
                            }
                        }
                    }
                }
                stage('Build Job Planning Service Image') {
                    steps {
                        dir('JobPlanning') {
                            script {
                                dockerImageJobPlanning = docker.build("${IMAGE_NAME_JOB_PLANNING}:${VERSION}")
                            }
                        }
                    }
                }
                stage('Build Alertes Service Image') {
                    steps {
                        dir('Alertes') {
                            script {
                                dockerImageAlertes = docker.build("${IMAGE_NAME_ALERTES}:${VERSION}")
                            }
                        }
                    }
                }
            }
        }

        stage('Scan Docker Images') {
            parallel {
                stage('Scan API Gateway Image') {
                    steps {
                        script {
                            sh """
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image --exit-code 0 \
                            --severity LOW,MEDIUM,HIGH,CRITICAL \
                            ${IMAGE_NAME_API_GATEWAY}:${VERSION}
                            """
                        }
                    }
                }
                stage('Scan Employee Service Image') {
                    steps {
                        script {
                            sh """
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image --exit-code 0 \
                            --severity LOW,MEDIUM,HIGH,CRITICAL \
                            ${IMAGE_NAME_EMPLOYEE}:${VERSION}
                            """
                        }
                    }
                }
                stage('Scan Job Planning Service Image') {
                    steps {
                        script {
                            sh """
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image --exit-code 0 \
                            --severity LOW,MEDIUM,HIGH,CRITICAL \
                            ${IMAGE_NAME_JOB_PLANNING}:${VERSION}
                            """
                        }
                    }
                }
                stage('Scan Alertes Service Image') {
                    steps {
                        script {
                            sh """
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:latest image --exit-code 0 \
                            --severity LOW,MEDIUM,HIGH,CRITICAL \
                            ${IMAGE_NAME_ALERTES}:${VERSION}
                            """
                        }
                    }
                }
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS) {
                        dockerImageApiGateway.push()
                        dockerImageEmployee.push()
                        dockerImageJobPlanning.push()
                        dockerImageAlertes.push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }
    }

    post {
        always {
            sh 'docker compose -f docker-compose.yml down || true'
            cleanWs()
        }
    }
}


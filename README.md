
# Serverless E-Commerce Project

A modern, scalable, and event-driven e-commerce backend built with AWS Serverless technologies. This project demonstrates a microservices architecture using AWS Lambda, API Gateway, DynamoDB, EventBridge, and more. Each domain (user, order, inventory, payment) is implemented as an independent serverless service.

---

## Table of Contents
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Service Communication](#service-communication)
- [How to Run](#how-to-run)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

- **Microservices**: Each business domain (user, order, inventory, payment) is a separate serverless service.
- **Event-Driven**: Services communicate via AWS EventBridge for decoupled, scalable event handling.
- **REST API**: API Gateway exposes REST endpoints for client interaction.
- **DynamoDB**: Each service manages its own data in DynamoDB tables.
- **Shared Utilities**: Common logic (logging, error handling, response formatting, circuit breaker) is shared across services.

---

## Technologies Used
- **AWS Lambda**: Serverless compute for business logic
- **AWS API Gateway**: RESTful API endpoints
- **AWS EventBridge**: Event bus for service-to-service communication
- **AWS DynamoDB**: NoSQL database
- **AWS Step Functions**: Orchestration (mainly for payment flows)
- **AWS CloudWatch**: Monitoring and logging
- **Serverless Framework**: Infrastructure as code and deployment
- **Node.js**: Runtime for all services
- **Terraform**: (Optional) Infrastructure provisioning

---

## Project Structure

```
serverless-ecommerce/
├── infrastructure/           # Terraform and infra modules
│   ├── cloudwatch-dashboard.tf
│   └── modules/
│       └── eventbridge/
│           └── dlq.tf
├── services/
│   ├── user-service/
│   │   ├── serverless.yml
│   │   └── src/
│   │       ├── handlers/
│   │       ├── models/
│   │       ├── services/
│   │       └── events/
│   ├── order-service/
│   ├── inventory-service/
│   └── payment-service/
├── shared/
│   └── utils/
│       ├── circuit-breaker.js
│       ├── error-handler.js
│       ├── logger.js
│       └── response.js
├── package.json
└── README.md
```

---

## Service Communication

- **REST API**: API Gateway routes HTTP requests to Lambda handlers (e.g., `create-user.js`, `create-order.js`).
- **EventBridge**: After key actions (user created, order placed, etc.), services publish events (e.g., `user-events.js`, `order-events.js`). Other services subscribe to these events and react accordingly.
- **Step Functions**: Used in payment-service for orchestrating multi-step payment flows.
- **DLQ (Dead Letter Queue)**: Failed events are sent to DLQ for later inspection and reprocessing.
- **Shared Utilities**: All services use common logging, error handling, and response formatting utilities from `shared/utils`.

---

## How to Run

### Prerequisites
- Node.js (v16+ recommended)
- npm
- AWS account & credentials configured (via AWS CLI or environment variables)
- Serverless Framework installed globally:
	```sh
	npm install -g serverless
	```

### Installation
1. Clone the repository:
	 ```sh
	 git clone https://github.com/<your-username>/serverless-ecommerce.git
	 cd serverless-ecommerce
	 ```
2. Install root dependencies:
	 ```sh
	 npm install
	 ```
3. Install dependencies for each service:
	 ```sh
	 cd services/user-service && npm install
	 cd ../order-service && npm install
	 cd ../inventory-service && npm install
	 cd ../payment-service && npm install
	 cd ../../
	 ```

### Deployment (to AWS)
Deploy each service individually:
```sh
cd services/user-service && serverless deploy
cd ../order-service && serverless deploy
cd ../inventory-service && serverless deploy
cd ../payment-service && serverless deploy
```

### Local Development (Optional)
You can use [serverless-offline](https://www.npmjs.com/package/serverless-offline) for local testing:
```sh
npm install --save-dev serverless-offline
serverless offline
```

## License
This project is licensed under the MIT License.

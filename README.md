# Data Integration API

This project is an Express-based API for storing and retrieving metric readings. The API allows you to send plaintext data, store it, and retrieve it later with calculated average power values for specific date ranges.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [POST /data](#post-data)
  - [GET /data](#get-data)
- [Testing](#testing)
- [Development Notes](#development-notes)
  - [Measuring API Performance](#measuring-api-performance)
  - [Optimizing for Traffic Patterns](#optimizing-for-traffic-patterns)
  - [Scaling to Millions of Connections](#scaling-to-millions-of-connections)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js v14 or higher
- npm or yarn

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/jianzhu0119/data-integration-api.git
   cd data-integration-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory with the following content:

   ```env
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```
   or
   ```bash
   yarn start
   ```

The server should now be running on `http://localhost:3000`.

## Usage

### API Endpoints

#### POST /data

This endpoint receives data in plaintext format, parses it, and stores it in the database.

- **URL**: `/data`
- **Method**: `POST`
- **Content-Type**: `text/plain`
- **Request Body**: Each line should contain a `timestamp`, `metric name`, and `metric value`, separated by spaces.
  - Example:
    ```plaintext
    1649941817 Voltage 1.34
    1649941818 Current 12.0
    ```
- **Success Response**:
  - **Code**: `200`
  - **Content**: `{ "success": true }`
- **Error Response**:
  - **Code**: `200`
  - **Content**: `{ "success": false }`
  - This will occur if the input data is malformed or cannot be parsed.

#### GET /data

This endpoint retrieves data within a specified date range and calculates the average power for each day.

- **URL**: `/data`
- **Method**: `GET`
- **Query Parameters**:
  - `from`: The start date (ISO 8601 format).
  - `to`: The end date (ISO 8601 format).
- **Success Response**:
  - **Code**: `200`
  - **Content**:
    ```json
    [
      {
        "time": "2022-04-14T13:10:17.000Z",
        "name": "Voltage",
        "value": 1.34
      },
      {
        "time": "2022-04-14T13:10:17.000Z",
        "name": "Current",
        "value": 14
      },
      {
        "time": "2022-04-14T00:00:00.000Z",
        "name": "Power",
        "value": 18.76
      }
    ]
    ```
- **Error Response**:
  - **Code**: `200`
  - **Content**: `{ "success": false }`
  - This will occur if the `from` or `to` parameters are missing or invalid.

## Testing

### Running Unit Tests

Unit tests are implemented using Jest and Supertest. To run the tests:

```bash
npm test
```

## Development Notes

### Measuring API Performance

- Load Testing: Tools like Apache JMeter, Artillery, or Locust can simulate a large number of requests and help measure the API's response time, throughput, and error rate under different levels of load.
- Profiling: Using tools like Node.js's built-in profiler or more advanced tools like Clinic.js, we can identify performance bottlenecks in the code, such as slow database queries, heavy computations, or inefficient loops.
- Monitoring in Production: Implementing APM (Application Performance Monitoring) solutions like New Relic, Datadog, or Prometheus with Grafana can help monitor the API's performance in real-time, including metrics such as CPU usage, memory consumption, request latency, and error rates.
- Benchmarking: Using benchmarking tools to compare the performance of various approaches (e.g., different data structures, caching strategies) to ensure the most efficient solution is used in the API.

### Optimizing for Traffic Patterns

1. If the API Receives Many More POST Requests Than GET Requests:

> - Batch Processing: If the POST requests involve heavy processing or storing data, consider batching them to reduce the load on the database and improve throughput.
> - Async Processing: Offload intensive tasks to background jobs or worker queues (e.g., using Bull or Kue with Redis) to ensure the API responds quickly and handles more POST requests concurrently.
> - Load Balancing: Distribute the POST request load across multiple instances of the API using load balancers like NGINX or AWS Elastic Load Balancing.
> - Optimized Data Storage: Use efficient data storage mechanisms (e.g., indexing, partitioning in databases) to handle high volumes of write operations efficiently.

2. If the API Receives Many More GET Requests Than POST Requests:

> - Caching: Implement caching mechanisms (e.g., Redis, Memcached) for frequently requested data to reduce the load on the database and improve response times.
> - Read Replicas: Use database read replicas to distribute the read load and ensure that high volumes of GET requests do not overwhelm a single database instance.
> - Content Delivery Network (CDN): For static data or data that doesn't change frequently, use a CDN to serve the data from edge locations closer to the user, reducing latency.

### Scaling to Millions of Connections

- Horizontal Scaling: Deploy the API across multiple servers or containers and use load balancers to distribute incoming requests evenly across all instances.
- Stateless Architecture: Ensure that the API is stateless, meaning it doesn’t store session data on the server. Use external storage like Redis for session management if necessary, enabling the API to scale horizontally without session consistency issues.
- Rate Limiting and Throttling: Implement rate limiting and throttling mechanisms to prevent abuse and ensure fair usage of the API by all clients.
- Database Sharding: For extremely high traffic, consider sharding the database to distribute data across multiple database servers, reducing the load on any single server.
- Message Queues: Use message queues (e.g., RabbitMQ, AWS SQS) to decouple and distribute processing tasks across multiple consumers, ensuring that the API remains responsive even under heavy load.
- Containerization and Orchestration: Use container orchestration platforms like Kubernetes to manage and scale the API's containers automatically based on traffic patterns and resource utilization.

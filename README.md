<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<h2 align="center">Shiksha Reports Service</h2>

<p align="center">
A backend service built using Node.js and NestJS for handling reporting and data processing within the Shiksha ecosystem.
</p>

---

## Description

Shiksha Reports is a NestJS-based service designed to handle reporting workflows.  
The repository processes and manages data and may integrate with event-driven systems.

---

## Tech Stack

- Node.js  
- NestJS  
- TypeScript  

---

## Prerequisites

- Node.js (v16 or higher)  
- npm or yarn  

---

## Installation

    git clone https://github.com/tekdi/shiksha-reports.git
    cd shiksha-reports
    npm install

---

## Environment Configuration

Create a `.env` file in the root directory:

    PORT=3000
    NODE_ENV=development

---

## Running the Application

    # development
    npm run start:dev

    # production
    npm run build
    npm run start:prod

---

## Running Tests

    npm run test
    npm run test:e2e
    npm run test:cov

---

## Project Structure

    src/
     ├── modules/
     ├── services/
     ├── controllers/
     ├── consumers/

---

## Contributing

1. Fork the repository  
2. Create a new branch  
3. Make your changes  
4. Submit a pull request  

---

## License

This project is licensed under the MIT License.
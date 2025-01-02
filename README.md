# µCoins Backend Repository - README

## Project Overview

**µCoins** is a decentralized cryptocurrency-based rewards system designed to promote academic achievement and active participation among students. Built using blockchain technology, the system ensures transparency, security, and privacy while motivating students through cryptocurrency incentives.

This repository contains the backend implementation of µCoins, which handles cryptocurrency transactions, task management, reward calculations, and secure data storage.

---

## Features

- **Decentralized Rewards System:** Built on blockchain for transparency and security.
- **Cryptocurrency Integration:** Utilizes µCoins for transactions and rewards.
- **Task Management:** Supports task creation, assignment, and approval workflows.
- **Secure Transactions:** Ensures privacy and data integrity using encryption.
- **Dynamic Reward Calculation:** Adjusts rewards based on task difficulty, duration, and attendance.
- **Admin and Faculty Interfaces:** Manage tasks, monitor performance, and approve rewards.
- **Student Interface:** Submit tasks, view eligible tasks, and redeem rewards.
- **Scalable Architecture:** Suitable for educational institutions with plans for expansion.

---

## Technology Stack

- **Backend Framework:** Node.js with Express.js
- **Blockchain Framework:** Ethereum, Solidity, Web3.js
- **Database:** MongoDB
- **Development Tools:** Ganache, Truffle, Metamask
- **Cloud Storage:** Cloudinary (for task proof uploads)

---

## Prerequisites

- **Node.js** (v14.17.0 or higher)
- **NPM** (v6.14.13 or higher)
- **MongoDB** (v4.4 or higher)
- **Ganache** (for blockchain testing)
- **Metamask Wallet** (for transactions)

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/bensoncordeiro/mucoins-backend.git
   cd mucoins-backend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and define the following:

   ```plaintext
   PORT=<your_port_number>
   MONGODB_URI=<your_mongodb_uri>
   CORS_ORIGIN=<your_cors_origin>
   ACCESS_TOKEN_SECRET=<your_access_token_secret>
   ACCESS_TOKEN_EXPIRY=<your_access_token_expiry_time>
   REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
   REFRESH_TOKEN_EXPIRY=<your_refresh_token_expiry_time>
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   BASE_MULTIPLIER_ID=<your_base_multiplier_id>
   ADMIN_WALLET_ADDRESS=<your_admin_wallet_address>
   ADMIN_WALLET_PRIVATE_KEY=<your_admin_wallet_private_key>
   ```

4. **Start Development Server:**

   ```bash
   npm start
   ```

   Server will be available at `http://localhost:<yourSelectedPortInENV>`

---

## API Endpoints

### Authentication

- **POST /auth/register** - Register users (admin, faculty, or student)
- **POST /auth/login** - Login for all roles

### Task Management

- **POST /tasks/create** - Faculty can create tasks
- **GET /tasks/student** - Students fetch available tasks
- **POST /tasks/submit** - Students submit task proofs
- **PUT /tasks/approve** - Faculty approve/reject submitted tasks

### Rewards

- **GET /rewards/view** - Students view redeemable rewards
- **POST /rewards/redeem** - Students redeem rewards

---

## Reward Calculation

Rewards are dynamically calculated based on task parameters:

- **Base Multiplier:** Configurable by admin.
- **Task Difficulty:** Set by faculty (Easy, Medium, Hard).
- **Task Duration:** Estimated time to complete.
- **Attendance Factor:** Students with attendance below 75% receive reduced rewards.

Formula:

```
Multiplier = (0.25 + Attendance/100) + (0.33 * Difficulty) + BaseMultiplier
Reward = Multiplier * Hours
```

---

## Testing

### Test Cases

- **User Authentication:** Sign-up, login, and authorization.
- **Task Operations:** Task creation, submission, and approval workflows.
- **Reward Transactions:** Secure transfer of µCoins.

### Running Tests

```bash
npm test
```

---

## Future Scope

- **Multi-institution Support:** Expand usability to other universities.
- **Cross-Platform Integration:** Enhance usability with mobile apps.
- **Business Collaboration:** Integrate third-party reward providers.
- **Enhanced Security Features:** Multi-signature wallets and advanced encryption.

---

## Contributors

- **Benson Cordeiro** - 1020121
- **Aamna Ahmed** - 1020105
- **Milind Gupta** - 1020145
- **Joshua Johnson** - 1020155

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For queries, suggestions, or contributions, please contact the us through GitHub Issues.


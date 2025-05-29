# Cashworxs Admin Dashboard

This is the admin dashboard for the Cashworxs application. It provides a centralized interface for managing various aspects of the system, including users, transactions, and settings.

## Features

- **User Management:** View, create, edit, and delete user accounts. Manage user roles and permissions.
- **Transaction Management:** Monitor and manage all transactions within the system. View transaction details, including sender, receiver, amount, and status.
- **Reporting and Analytics:** Generate reports on key metrics, such as total transactions, user activity, and revenue.
- **Settings Management:** Configure system-wide settings, such as payment gateways, currency settings, and notification preferences.
- **Security:** Secure access to the dashboard with role-based authentication and authorization.

## Technologies Used

- **Frontend:** React, Next.js, MUI
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/crakton/cashworxs-admin.git
    ```

2.  **Install dependencies:**

    ```bash
    cd cashworxs-admin
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory and add the necessary environment variables (database connection string, API keys, etc.). See `.env.example` for a template.

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Access the dashboard:**
    Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please follow the guidelines outlined in the `CONTRIBUTING.md` file.

## License

This project is licensed under the MIT License.

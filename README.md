# HydroFi - Green Hydrogen Credit System

A full-stack MERN application for managing green hydrogen production, certification, and carbon credit trading.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access
- **Role-Based Dashboards**: Different interfaces for each user type
- **Real-time Data**: Dynamic dashboard content based on user roles
- **Responsive Design**: Modern UI that works across devices

## User Roles

1. **Green Hydrogen Producer**: Manage production facilities and carbon credits
2. **Regulatory Authority**: Oversee compliance and certifications
3. **Industry Buyer**: Purchase and manage carbon credit portfolios
4. **Certification Body**: Conduct inspections and issue certifications

## Technology Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend

- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Context API for state management

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hydrofi_db
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Dashboard

- `GET /api/dashboard/data` - Get role-based dashboard data (protected)
- `GET /api/dashboard/producer` - Get producer-specific data (protected)
- `GET /api/dashboard/regulatory` - Get regulatory data (protected)
- `GET /api/dashboard/buyer` - Get buyer data (protected)
- `GET /api/dashboard/certification` - Get certification data (protected)

## Usage

1. **Registration**: Create an account by selecting your role and providing credentials
2. **Login**: Access your role-specific dashboard
3. **Dashboard**: View relevant data and perform actions based on your role
4. **Navigation**: Use the navbar to switch between pages and logout

## Project Structure

```
HydroFi_Final/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── dashboard.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── dashboards/
    │   │   ├── Home.jsx
    │   │   └── Navbar.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Security Features

- Password hashing with bcryptjs
- JWT-based stateless authentication
- Role-based route protection
- Input validation and sanitization
- CORS configuration

## Future Enhancements

- Real blockchain integration
- Advanced analytics and reporting
- Real-time notifications
- File upload for certificates
- Advanced search and filtering
- Email verification
- Password reset functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

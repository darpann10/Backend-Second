# MoodMitra Backend API

A robust Node.js backend for the MoodMitra web application, providing comprehensive mood tracking, journal management, analytics, and user authentication features.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with signup, login, and profile management
- **Mood Tracking**: Daily mood entries with scoring and historical data
- **Journal Management**: Personal journaling with sentiment analysis
- **Analytics & Insights**: Mood trends, streaks, and personalized insights
- **Notifications**: Daily reminders and notification system
- **External Integrations**: Sentiment analysis and motivational quotes
- **Security**: Rate limiting, CORS, helmet protection, and input validation

## 🛠 Tech Stack

- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs, helmet, express-rate-limit
- **External APIs**: axios for HTTP requests
- **Validation**: express-validator
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone and Install**
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Health Check**
   ```
   GET http://localhost:3000/api/health
   ```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/moodmitra

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# External APIs (Optional)
SENTIMENT_API_KEY=your_sentiment_analysis_api_key
QUOTES_API_KEY=your_quotes_api_key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/update` - Update user profile

### Mood Tracking
- `POST /api/moods` - Submit mood entry
- `GET /api/moods/daily` - Get today's mood
- `GET /api/moods/history` - Get mood history
- `GET /api/moods/average` - Get average mood score

### Journal Management
- `POST /api/journals` - Create journal entry
- `GET /api/journals/daily` - Get today's journal
- `GET /api/journals/history` - Get journal history
- `GET /api/journals/sentiment/:id` - Analyze journal sentiment

### Analytics & Insights
- `GET /api/analytics/trends` - Get mood trends
- `GET /api/analytics/streaks` - Get mood streaks
- `GET /api/analytics/insights` - Get personalized insights

### Notifications
- `POST /api/notifications/reminder` - Set daily reminder
- `GET /api/notifications/reminder` - Get reminder settings
- `DELETE /api/notifications/reminder` - Remove reminder
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### External Integrations
- `POST /api/sentiment/analyze` - Analyze text sentiment
- `GET /api/quotes/mood` - Get mood-based quotes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers protection

## 📊 Data Models

### User
- Personal information and authentication
- Role-based access control
- Reminder preferences

### Mood
- Daily mood entries with 1-5 scoring
- Tags and notes support
- Timestamp tracking

### Journal
- Personal journal entries
- Sentiment analysis integration
- Privacy controls

### Notification
- System notifications
- Reminder management
- Read/unread status

## 🚀 Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB connection
   - Set secure JWT secret

2. **Build & Start**
   ```bash
   npm install --production
   npm start
   ```

3. **Health Monitoring**
   - Monitor `/api/health` endpoint
   - Set up logging and error tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

---

**MoodMitra Backend** - Empowering mental wellness through technology 🧠💚

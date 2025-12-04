import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { authRoutes } from './modules/auth';
import { hospitalsRoutes } from './modules/hospitals';
import { errorHandler, notFoundHandler, sanitizeAll } from './shared/middleware';
import { connectDatabase, disconnectDatabase } from './shared/utils/prisma.util';
import { appConfig } from './config';

const app: Application = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: appConfig.corsOrigin === '*' 
    ? '*' 
    : appConfig.corsOrigin.split(',').map(origin => origin.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize all inputs
app.use(sanitizeAll);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management API',
      version: '1.0.0',
      description: 'API for Hospital Management System with JWT Authentication',
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/*/*.routes.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Hospital Management API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      hospitals: '/api/hospitals',
      docs: '/api-docs',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalsRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(appConfig.port, () => {
      console.log(`Server is running on port ${appConfig.port}`);
      console.log(`Environment: ${appConfig.nodeEnv}`);
      console.log(`API Documentation: http://localhost:${appConfig.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoMarket API',
      version: '1.0.0',
      description: 'API de la marketplace EcoMarket — mise en relation producteurs locaux et consommateurs',
    },
    servers: [
      { url: 'http://localhost:4000/api', description: 'Développement local' },
      { url: 'https://lorick-dev-taf-production.up.railway.app/api', description: 'Production' },
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
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
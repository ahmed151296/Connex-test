const express = require('express');
const Ajv = require('ajv');
const promClient = require('prom-client');
const ajv = new Ajv();
const app = express();

// Define a schema for the response
const responseSchema = {
  type: 'object',
  properties: {
    epoch: {
      description: 'The current server time, in epoch seconds, at the time of processing the request.',
      type: 'number',
    },
  },
  required: ['epoch'],
};

// Create a validator function
const validateResponse = ajv.compile(responseSchema);

// Create a Prometheus metrics registry
const prometheusRegistry = new promClient.Registry();

// Enable default recommended metrics
promClient.collectDefaultMetrics({ register: prometheusRegistry });

// Middleware to check the Authorization header
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader === 'cd') {
    next(); // Continue to the next middleware or route handler
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Apply the authMiddleware to all routes except /metrics
app.use((req, res, next) => {
  if (req.path === '/metrics') {
    next();
  } else {
    authMiddleware(req, res, next);
  }
});

// Define a route that gets the server time in epoch seconds
app.get('/getServerTime', (req, res) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const response = { epoch: currentTimeInSeconds };

  if (validateResponse(response)) {
    res.json(response);
  } else {
    res.status(500).json({ error: 'Response validation failed' });
  }
});

// Define a /metrics endpoint for Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await prometheusRegistry.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
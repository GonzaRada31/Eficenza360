import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
const Resource = require('@opentelemetry/resources').Resource;

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const exporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'eficenza-api-enterprise',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  metricReader: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Auto-instruments Http, Express, NestJS, Prisma, etc.
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

// Starts the SDK
otelSDK.start();

process.on('SIGTERM', () => {
  otelSDK.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

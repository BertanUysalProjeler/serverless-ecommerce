const { CloudWatchLogsClient, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

class StructuredLogger {
  constructor() {
    this.client = new CloudWatchLogsClient({ region: process.env.AWS_REGION });
    this.logGroupName = process.env.LOG_GROUP_NAME || '/aws/lambda/ecommerce-platform';
    this.logStreamName = `${new Date().toISOString().split('T')[0]}/${process.env.AWS_LAMBDA_FUNCTION_NAME}`;
  }

  async log(level, message, context = {}) {
    const logEvent = {
      level,
      message,
      timestamp: new Date().toISOString(),
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      awsRequestId: process.env.AWS_REQUEST_ID,
      ...context
    };

    // Console output for local development
    if (process.env.NODE_ENV === 'local') {
      console.log(JSON.stringify(logEvent));
      return;
    }

    // CloudWatch upload for AWS
    try {
      const params = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [
          {
            timestamp: Date.now(),
            message: JSON.stringify(logEvent)
          }
        ]
      };

      await this.client.send(new PutLogEventsCommand(params));
    } catch (error) {
      console.error('Failed to send logs to CloudWatch:', error);
    }
  }

  info(message, context = {}) {
    return this.log('INFO', message, context);
  }

  error(message, context = {}) {
    return this.log('ERROR', message, context);
  }

  warn(message, context = {}) {
    return this.log('WARN', message, context);
  }
}

module.exports = new StructuredLogger();
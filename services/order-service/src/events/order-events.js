const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../../../../shared/utils/logger');

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Publish OrderCreated event to EventBridge
 * @param {Object} orderData - The order data
 * @param {string} orderData.id - Order ID
 * @param {string} orderData.userId - User ID
 * @param {Array} orderData.items - Order items
 * @param {number} orderData.totalAmount - Total order amount
 * @returns {Promise} Event publishing result
 */
async function publishOrderCreatedEvent(orderData) {
  const event = {
    Source: 'ecommerce.orders',
    DetailType: 'OrderCreated',
    Detail: JSON.stringify({
      orderId: orderData.id,
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      createdAt: new Date().toISOString()
    }),
    EventBusName: process.env.EVENT_BUS_NAME || 'default'
  };

  try {
    const command = new PutEventsCommand({ Entries: [event] });
    const result = await eventBridge.send(command);
    logger.info('OrderCreated event published successfully', { orderId: orderData.id });
    return result;
  } catch (error) {
    logger.error('Failed to publish OrderCreated event', { error: error.message, orderId: orderData.id });
    throw error;
  }
}

/**
 * Publish OrderUpdated event to EventBridge
 * @param {Object} orderData - The order data
 */
async function publishOrderUpdatedEvent(orderData) {
  const event = {
    Source: 'ecommerce.orders',
    DetailType: 'OrderUpdated',
    Detail: JSON.stringify({
      orderId: orderData.id,
      status: orderData.status,
      updatedAt: new Date().toISOString()
    }),
    EventBusName: process.env.EVENT_BUS_NAME || 'default'
  };

  try {
    const command = new PutEventsCommand({ Entries: [event] });
    await eventBridge.send(command);
    logger.info('OrderUpdated event published successfully', { orderId: orderData.id });
  } catch (error) {
    logger.error('Failed to publish OrderUpdated event', { error: error.message, orderId: orderData.id });
    // Don't throw error for event publishing failures to avoid affecting main order flow
  }
}

module.exports = {
  publishOrderCreatedEvent,
  publishOrderUpdatedEvent
};
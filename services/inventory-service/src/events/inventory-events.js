const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../../../../shared/utils/logger');

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Publish InventoryUpdated event to EventBridge
 * @param {Object} inventoryData - The inventory update data
 * @returns {Promise} Event publishing result
 */
async function publishInventoryUpdatedEvent(inventoryData) {
  const event = {
    Source: 'ecommerce.inventory',
    DetailType: 'InventoryUpdated',
    Detail: JSON.stringify({
      ...inventoryData,
      timestamp: new Date().toISOString()
    }),
    EventBusName: process.env.EVENT_BUS_NAME || 'default'
  };

  try {
    const command = new PutEventsCommand({ Entries: [event] });
    const result = await eventBridge.send(command);
    logger.info('InventoryUpdated event published successfully');
    return result;
  } catch (error) {
    logger.error('Failed to publish InventoryUpdated event', { error: error.message });
    // Don't throw error for event publishing failures
  }
}

/**
 * Publish LowStockWarning event to EventBridge
 * @param {Object} warningData - The low stock warning data
 * @returns {Promise} Event publishing result
 */
async function publishLowStockWarning(warningData) {
  const event = {
    Source: 'ecommerce.inventory',
    DetailType: 'LowStockWarning',
    Detail: JSON.stringify({
      ...warningData,
      timestamp: new Date().toISOString()
    }),
    EventBusName: process.env.EVENT_BUS_NAME || 'default'
  };

  try {
    const command = new PutEventsCommand({ Entries: [event] });
    const result = await eventBridge.send(command);
    logger.info('LowStockWarning event published successfully');
    return result;
  } catch (error) {
    logger.error('Failed to publish LowStockWarning event', { error: error.message });
  }
}

module.exports = {
  publishInventoryUpdatedEvent,
  publishLowStockWarning
};
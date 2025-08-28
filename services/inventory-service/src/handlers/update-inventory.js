const { InventoryService } = require('../services/inventory-service');
const { errorHandler } = require('../../../../shared/utils/error-handler');
const logger = require('../../../../shared/utils/logger');

/**
 * Lambda handler for processing inventory updates from OrderCreated events
 * @param {Object} event - EventBridge event
 * @returns {Object} Processing result
 */
async function updateInventoryHandler(event) {
  try {
    logger.info('Processing inventory update from event', { 
      eventSource: event.source,
      detailType: event['detail-type'] 
    });

    // Parse event detail from EventBridge
    const orderDetail = JSON.parse(event.detail);
    
    // Validate required data
    if (!orderDetail.orderId || !orderDetail.items || !Array.isArray(orderDetail.items)) {
      throw new ValidationError('Invalid order data in event: orderId and items are required');
    }

    // Process inventory update
    const inventoryService = new InventoryService();
    const updatedInventory = await inventoryService.processOrderInventory(orderDetail.items);

    logger.info('Inventory updated successfully', { 
      orderId: orderDetail.orderId,
      updatedItems: updatedInventory.length
    });

    return {
      status: 'SUCCESS',
      orderId: orderDetail.orderId,
      updatedItems: updatedInventory.length
    };
  } catch (error) {
    logger.error('Failed to update inventory', {
      error: error.message,
      event: event
    });

    // For inventory errors, we want to notify the order service
    // This could trigger a compensation action (like order cancellation)
    if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
      // Log the error but don't throw to prevent EventBridge retries
      // In a real scenario, you might publish a failed event
      logger.warn('Inventory update failed - order may need compensation', {
        orderId: event.detail?.orderId,
        error: error.message
      });
      return { status: 'FAILED', error: error.message };
    }

    // Throw error to allow EventBridge retry mechanism for transient errors
    throw error;
  }
}

module.exports = { updateInventoryHandler };
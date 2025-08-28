const { OrderService } = require('../services/order-service');
const { createResponse } = require('../../../../shared/utils/response');
const { errorHandler } = require('../../../../shared/utils/error-handler');
const { publishOrderCreatedEvent } = require('../events/order-events');

/**
 * Lambda handler for creating a new order
 * @param {Object} event - API Gateway event
 * @returns {Object} API Gateway response
 */
async function createOrderHandler(event) {
  try {
    // Parse and validate request body
    const orderData = JSON.parse(event.body);
    
    // Validate required fields
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      throw new ValidationError('UserId and items are required');
    }

    // Create order using OrderService
    const orderService = new OrderService();
    const newOrder = await orderService.createOrder(orderData);

    // Publish OrderCreated event asynchronously
    // Note: We don't await this to avoid blocking the response
    publishOrderCreatedEvent(newOrder)
      .catch(error => {
        // Log error but don't fail the order creation
        console.error('Event publishing failed but order was created:', error);
      });

    // Return success response
    return createResponse(201, newOrder);
  } catch (error) {
    return errorHandler(error, 'createOrderHandler');
  }
}

module.exports = { createOrderHandler };
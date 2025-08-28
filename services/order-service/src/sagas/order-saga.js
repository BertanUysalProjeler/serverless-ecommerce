const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../../../../shared/utils/logger');

class OrderSaga {
  constructor() {
    this.eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION });
  }

  async startSaga(orderData) {
    const sagaId = `saga-${orderData.id}-${Date.now()}`;
    
    try {
      // Step 1: Reserve inventory
      await this.publishSagaEvent(sagaId, 'InventoryReservationStarted', orderData);
      
      // Step 2: Process payment
      await this.publishSagaEvent(sagaId, 'PaymentProcessingStarted', orderData);
      
      return sagaId;
    } catch (error) {
      await this.compensate(sagaId, orderData, error);
      throw error;
    }
  }

  async compensate(sagaId, orderData, error) {
    logger.warn('Starting saga compensation', { sagaId, orderId: orderData.id });
    
    try {
      // Compensate inventory reservation
      await this.publishSagaEvent(sagaId, 'InventoryCompensationStarted', orderData);
      
      // Compensate payment if needed
      if (error.isPaymentProcessed) {
        await this.publishSagaEvent(sagaId, 'PaymentCompensationStarted', orderData);
      }

      await this.publishSagaEvent(sagaId, 'OrderFailed', {
        ...orderData,
        reason: error.message
      });
    } catch (compError) {
      logger.error('Saga compensation failed', { sagaId, error: compError.message });
    }
  }

  async publishSagaEvent(sagaId, eventType, data) {
    const event = {
      Source: 'ecommerce.saga',
      DetailType: eventType,
      Detail: JSON.stringify({
        sagaId,
        ...data,
        timestamp: new Date().toISOString()
      }),
      EventBusName: process.env.EVENT_BUS_NAME
    };

    try {
      const command = new PutEventsCommand({ Entries: [event] });
      await this.eventBridge.send(command);
    } catch (error) {
      logger.error('Failed to publish saga event', { sagaId, eventType, error: error.message });
      throw error;
    }
  }
}

module.exports = { OrderSaga };
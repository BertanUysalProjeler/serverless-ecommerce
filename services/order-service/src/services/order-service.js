// ... mevcut kodlar ...

const { publishOrderCreatedEvent } = require('../events/order-events');
const { publishOrderFailedEvent } = require('../events/order-events');

class OrderService {
  // ... mevcut kodlar ...

  /**
   * Create a new order with inventory validation
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      // Önce inventory service ile stok kontrolü yap
      await this.validateInventory(orderData.items);

      // Sonra order oluştur
      const order = await this.orderModel.createOrder(orderData);
      
      // Event yayınla (async olarak)
      publishOrderCreatedEvent(order).catch(error => {
        logger.error('Failed to publish OrderCreated event', { error: error.message });
      });

      return order;
    } catch (error) {
      // Inventory hatası durumunda failed event yayınla
      if (error.name === 'ValidationError' && error.message.includes('stock')) {
        publishOrderFailedEvent({
          ...orderData,
          reason: 'INSUFFICIENT_STOCK',
          error: error.message
        }).catch(e => {
          logger.error('Failed to publish OrderFailed event', { error: e.message });
        });
      }
      throw error;
    }
  }

  /**
   * Validate inventory before creating order
   * @param {Array} items - Order items
   * @private
   */
  async validateInventory(items) {
    // Burada inventory service ile stok kontrolü yapılabilir
    // Şimdilik basit bir simülasyon yapıyoruz
    for (const item of items) {
      if (item.quantity > 10) { // Simüle edilmiş stok kontrolü
        throw new ValidationError(`Insufficient stock for product: ${item.productId}`);
      }
    }
  }
}
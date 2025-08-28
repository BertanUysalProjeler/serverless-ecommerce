const { InventoryModel } = require('../models/inventory-model');
const { publishInventoryUpdatedEvent } = require('../events/inventory-events');
const { ValidationError } = require('../../../../shared/utils/error-handler');

class InventoryService {
  constructor() {
    this.inventoryModel = new InventoryModel();
  }

  /**
   * Process inventory update for an order
   * @param {Array} items - Order items
   * @param {boolean} isRestock - Whether to restock (add) instead of deduct
   * @returns {Promise<Array>} Updated inventory items
   */
  async processOrderInventory(items, isRestock = false) {
    try {
      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Items array is required and cannot be empty');
      }

      // Prepare inventory updates
      const inventoryUpdates = items.map(item => ({
        productId: item.productId,
        quantityChange: isRestock ? item.quantity : -item.quantity
      }));

      // Execute batch update
      const updatedItems = await this.inventoryModel.batchUpdateInventory(inventoryUpdates);

      // Publish inventory updated event
      await publishInventoryUpdatedEvent({
        items: updatedItems,
        operation: isRestock ? 'RESTOCK' : 'DEDUCT'
      });

      return updatedItems;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inventory for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Inventory item
   */
  async getInventory(productId) {
    try {
      const inventoryItem = await this.inventoryModel.getInventoryItem(productId);
      if (!inventoryItem) {
        throw new NotFoundError(`Inventory not found for product: ${productId}`);
      }
      return inventoryItem;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new inventory item
   * @param {Object} inventoryData - Inventory data
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventory(inventoryData) {
    try {
      // Validate required fields
      if (!inventoryData.productId || !inventoryData.quantity) {
        throw new ValidationError('productId and quantity are required');
      }

      if (inventoryData.quantity < 0) {
        throw new ValidationError('Quantity cannot be negative');
      }

      const inventoryItem = await this.inventoryModel.createInventoryItem(inventoryData);
      return inventoryItem;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { InventoryService };
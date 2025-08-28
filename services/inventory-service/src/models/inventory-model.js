const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../../shared/utils/logger');
const { ValidationError } = require('../../../../shared/utils/error-handler');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocument.from(client);

class InventoryModel {
  constructor() {
    this.tableName = process.env.INVENTORY_TABLE;
  }

  /**
   * Get inventory item by product ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Inventory item
   */
  async getInventoryItem(productId) {
    try {
      const params = {
        TableName: this.tableName,
        Key: { productId }
      };

      const result = await docClient.get(params);
      return result.Item;
    } catch (error) {
      logger.error('Error getting inventory item', { productId, error: error.message });
      throw error;
    }
  }

  /**
   * Update inventory quantity for a product
   * @param {string} productId - Product ID
   * @param {number} quantityChange - Quantity to deduct (negative) or add (positive)
   * @returns {Promise<Object>} Updated inventory item
   */
  async updateInventoryQuantity(productId, quantityChange) {
    try {
      const params = {
        TableName: this.tableName,
        Key: { productId },
        UpdateExpression: 'SET quantity = quantity + :change, updatedAt = :updatedAt',
        ConditionExpression: 'quantity >= :changeAbs AND attribute_exists(productId)',
        ExpressionAttributeValues: {
          ':change': quantityChange,
          ':changeAbs': Math.abs(quantityChange),
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };

      const result = await docClient.update(params);
      return result.Attributes;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new ValidationError(`Insufficient stock for product: ${productId}`);
      }
      logger.error('Error updating inventory', { productId, quantityChange, error: error.message });
      throw error;
    }
  }

  /**
   * Batch update inventory for multiple products
   * @param {Array} updates - Array of { productId, quantityChange }
   * @returns {Promise<Array>} Results of updates
   */
  async batchUpdateInventory(updates) {
    try {
      const updatePromises = updates.map(update => 
        this.updateInventoryQuantity(update.productId, update.quantityChange)
      );
      
      return await Promise.all(updatePromises);
    } catch (error) {
      logger.error('Error in batch inventory update', { updates, error: error.message });
      throw error;
    }
  }

  /**
   * Create a new inventory item
   * @param {Object} inventoryItem - Inventory item data
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventoryItem(inventoryItem) {
    try {
      const params = {
        TableName: this.tableName,
        Item: {
          ...inventoryItem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ConditionExpression: 'attribute_not_exists(productId)'
      };

      await docClient.put(params);
      return inventoryItem;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new ConflictError(`Inventory item already exists for product: ${inventoryItem.productId}`);
      }
      logger.error('Error creating inventory item', { inventoryItem, error: error.message });
      throw error;
    }
  }
}

module.exports = { InventoryModel };
const AWS = require('aws-sdk');
const logger = require('../../../../shared/utils/logger');

// DynamoDB client'ını oluştur
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USERS_TABLE || 'Users';

/**
 * User veritabanı operasyonları
 */
class UserModel {
    /**
     * Yeni kullanıcı oluşturur
     * @param {object} user - Kullanıcı verisi
     * @returns {Promise<object>} Oluşturulan kullanıcı
     */
    static async create(user) {
        const params = {
            TableName: TABLE_NAME,
            Item: user
        };

        try {
            await dynamoDB.put(params).promise();
            logger.info('User created successfully', { userId: user.userId });
            return user;
        } catch (error) {
            logger.error('Error creating user', error);
            throw error;
        }
    }

    /**
     * ID'ye göre kullanıcı getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<object|null>} Kullanıcı verisi veya null
     */
    static async getById(userId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { userId }
        };

        try {
            const result = await dynamoDB.get(params).promise();
            return result.Item || null;
        } catch (error) {
            logger.error('Error getting user', error);
            throw error;
        }
    }

    /**
     * Tüm kullanıcıları listeler
     * @returns {Promise<array>} Kullanıcı listesi
     */
    static async list() {
        const params = {
            TableName: TABLE_NAME,
            Limit: 100
        };

        try {
            const result = await dynamoDB.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            logger.error('Error listing users', error);
            throw error;
        }
    }

    /**
     * Kullanıcıyı günceller
     * @param {string} userId - Kullanıcı ID'si
     * @param {object} updates - Güncellenecek alanlar
     * @returns {Promise<object>} Güncellenmiş kullanıcı
     */
    static async update(userId, updates) {
        let updateExpression = 'set updatedAt = :updatedAt';
        let expressionAttributes = { ':updatedAt': new Date().toISOString() };

        // Dinamik update expression oluştur
        Object.keys(updates).forEach(key => {
            if (key !== 'userId') {
                updateExpression += `, ${key} = :${key}`;
                expressionAttributes[`:${key}`] = updates[key];
            }
        });

        const params = {
            TableName: TABLE_NAME,
            Key: { userId },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributes,
            ReturnValues: 'ALL_NEW'
        };

        try {
            const result = await dynamoDB.update(params).promise();
            logger.info('User updated successfully', { userId });
            return result.Attributes;
        } catch (error) {
            logger.error('Error updating user', error);
            throw error;
        }
    }

    /**
     * Kullanıcıyı siler
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<boolean>} Silme işlemi başarılı mı
     */
    static async delete(userId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { userId }
        };

        try {
            await dynamoDB.delete(params).promise();
            logger.info('User deleted successfully', { userId });
            return true;
        } catch (error) {
            logger.error('Error deleting user', error);
            throw error;
        }
    }
}

module.exports = UserModel;
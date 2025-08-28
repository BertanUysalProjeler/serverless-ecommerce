const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../../../../shared/utils/logger');

// EventBridge client'ını oluştur
const eventBridge = new EventBridgeClient({ 
    region: process.env.AWS_REGION || 'us-east-1' 
});

/**
 * EventBridge'e kullanıcı event'leri yayınlama servisi
 */
class UserEvents {
    /**
     * Yeni kullanıcı oluşturuldu event'ini yayınlar
     * @param {object} userData - Kullanıcı verisi
     * @returns {Promise<object>} EventBridge response
     */
    static async publishUserCreated(userData) {
        const params = {
            Entries: [
                {
                    Source: 'user.service',
                    DetailType: 'UserCreated',
                    Detail: JSON.stringify({
                        userId: userData.userId,
                        email: userData.email,
                        name: userData.name,
                        createdAt: userData.createdAt
                    }),
                    EventBusName: process.env.EVENT_BUS_NAME || 'default',
                    Time: new Date()
                }
            ]
        };

        try {
            const result = await eventBridge.send(new PutEventsCommand(params));
            logger.info('UserCreated event published successfully', { 
                userId: userData.userId,
                result: result.Entries
            });
            return result;
        } catch (error) {
            logger.error('Error publishing UserCreated event', error);
            throw error;
        }
    }

    /**
     * Kullanıcı güncellendi event'ini yayınlar
     * @param {object} userData - Kullanıcı verisi
     * @returns {Promise<object>} EventBridge response
     */
    static async publishUserUpdated(userData) {
        const params = {
            Entries: [
                {
                    Source: 'user.service',
                    DetailType: 'UserUpdated',
                    Detail: JSON.stringify({
                        userId: userData.userId,
                        email: userData.email,
                        name: userData.name,
                        updatedAt: userData.updatedAt
                    }),
                    EventBusName: process.env.EVENT_BUS_NAME || 'default',
                    Time: new Date()
                }
            ]
        };

        try {
            const result = await eventBridge.send(new PutEventsCommand(params));
            logger.info('UserUpdated event published successfully', { 
                userId: userData.userId,
                result: result.Entries
            });
            return result;
        } catch (error) {
            logger.error('Error publishing UserUpdated event', error);
            throw error;
        }
    }

    /**
     * Kullanıcı silindi event'ini yayınlar
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<object>} EventBridge response
     */
    static async publishUserDeleted(userId) {
        const params = {
            Entries: [
                {
                    Source: 'user.service',
                    DetailType: 'UserDeleted',
                    Detail: JSON.stringify({
                        userId: userId,
                        deletedAt: new Date().toISOString()
                    }),
                    EventBusName: process.env.EVENT_BUS_NAME || 'default',
                    Time: new Date()
                }
            ]
        };

        try {
            const result = await eventBridge.send(new PutEventsCommand(params));
            logger.info('UserDeleted event published successfully', { 
                userId: userId,
                result: result.Entries
            });
            return result;
        } catch (error) {
            logger.error('Error publishing UserDeleted event', error);
            throw error;
        }
    }
}

module.exports = UserEvents;
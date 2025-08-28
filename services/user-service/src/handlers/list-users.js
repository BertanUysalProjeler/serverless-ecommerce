const UserService = require('../services/user-service');
const { successResponse, errorResponse } = require('../../../../shared/utils/response');
const logger = require('../../../../shared/utils/logger');

/**
 * Tüm kullanıcıları listeleme endpoint handler'ı
 * @param {object} event - AWS Lambda event objesi
 * @returns {Promise<object>} API response
 */
module.exports.handler = async (event) => {
    try {
        logger.info('List users request received');

        // Query parameters'dan sayfalama bilgilerini al
        const limit = event.queryStringParameters?.limit || 100;
        const lastEvaluatedKey = event.queryStringParameters?.lastKey;
        
        logger.info('Pagination parameters', { limit, lastEvaluatedKey });

        // User servisini kullanarak kullanıcıları listele
        const users = await UserService.listUsers();

        // Başarılı response dön
        return successResponse(200, {
            users: users,
            count: users.length,
            // Sayfalama için sonraki sayfa token'ı
            // (Gerçek uygulamada DynamoDB'den gelen LastEvaluatedKey kullanılır)
            nextPageToken: users.length >= limit ? 'next-page-token' : null
        });

    } catch (error) {
        logger.error('Error in list users handler', error);
        return errorResponse(500, error.message);
    }
};
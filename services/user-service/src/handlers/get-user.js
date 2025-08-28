const UserService = require('../services/user-service');
const { successResponse, errorResponse } = require('../../../../shared/utils/response');
const logger = require('../../../../shared/utils/logger');

/**
 * Kullanıcı detaylarını getirme endpoint handler'ı
 * @param {object} event - AWS Lambda event objesi
 * @returns {Promise<object>} API response
 */
module.exports.handler = async (event) => {
    try {
        // Path parameters'dan userId'yi al
        const userId = event.pathParameters.userId;
        logger.info('Get user request received', { userId });

        // User servisini kullanarak kullanıcıyı getir
        const user = await UserService.getUser(userId);

        // Başarılı response dön
        return successResponse(200, user);

    } catch (error) {
        logger.error('Error in get user handler', error);

        // Hata türüne göre status code belirle
        let statusCode = 500;
        if (error.message === 'User not found') {
            statusCode = 404;
        }

        return errorResponse(statusCode, error.message);
    }
};
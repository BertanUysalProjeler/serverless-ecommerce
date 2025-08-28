const UserService = require('../services/user-service');
const { successResponse, errorResponse } = require('../../../../shared/utils/response');
const logger = require('../../../../shared/utils/logger');

/**
 * Kullanıcı silme endpoint handler'ı
 * @param {object} event - AWS Lambda event objesi
 * @returns {Promise<object>} API response
 */
module.exports.handler = async (event) => {
    try {
        // Path parameters'dan userId'yi al
        const userId = event.pathParameters.userId;
        logger.info('Delete user request received', { userId });

        // User servisini kullanarak kullanıcıyı sil
        await UserService.deleteUser(userId);

        logger.info('User deleted successfully', { userId });

        // Başarılı response dön
        return successResponse(200, {
            message: "User deleted successfully"
        });

    } catch (error) {
        logger.error('Error in delete user handler', error);

        // Hata türüne göre status code belirle
        let statusCode = 500;
        if (error.message === 'User not found') {
            statusCode = 404;
        }

        return errorResponse(statusCode, error.message);
    }
};
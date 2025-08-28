const UserService = require('../services/user-service');
const { successResponse, errorResponse } = require('../../../../shared/utils/response');
const logger = require('../../../../shared/utils/logger');

/**
 * Kullanıcı güncelleme endpoint handler'ı
 * @param {object} event - AWS Lambda event objesi
 * @returns {Promise<object>} API response
 */
module.exports.handler = async (event) => {
    try {
        // Path parameters'dan userId'yi al
        const userId = event.pathParameters.userId;
        
        // Request body'yi parse et
        const updateData = JSON.parse(event.body);
        logger.info('Update user request received', { userId, updateData });

        // User servisini kullanarak kullanıcıyı güncelle
        const updatedUser = await UserService.updateUser(userId, updateData);

        logger.info('User updated successfully', { userId });

        // Başarılı response dön
        return successResponse(200, {
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        logger.error('Error in update user handler', error);

        // Hata türüne göre status code belirle
        let statusCode = 500;
        if (error.message === 'User not found') {
            statusCode = 404;
        } else if (error.message === 'Cannot change userId') {
            statusCode = 400;
        }

        return errorResponse(statusCode, error.message);
    }
};
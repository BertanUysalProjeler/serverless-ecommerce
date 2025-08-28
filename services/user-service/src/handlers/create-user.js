const UserService = require('../services/user-service');
const UserEvents = require('../events/user-events');
const { successResponse, errorResponse } = require('../../../../shared/utils/response');
const logger = require('../../../../shared/utils/logger');

/**
 * Yeni kullanıcı oluşturma endpoint handler'ı (Event entegrasyonlu)
 * @param {object} event - AWS Lambda event objesi
 * @returns {Promise<object>} API response
 */
module.exports.handler = async (event) => {
    try {
        logger.info('Create user request received', { body: event.body });

        // Request body'yi parse et
        const userData = JSON.parse(event.body);

        // User servisini kullanarak kullanıcı oluştur
        const user = await UserService.createUser(userData);

        // EventBridge'e kullanıcı oluşturuldu event'ini yayınla
        await UserEvents.publishUserCreated(user);

        logger.info('User created and event published successfully', { 
            userId: user.userId 
        });

        // Başarılı response dön
        return successResponse(201, {
            message: "User created successfully",
            user: {
                userId: user.userId,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        logger.error('Error in create user handler', error);

        // Hata türüne göre status code belirle
        let statusCode = 500;
        if (error.message === 'Email and password are required') {
            statusCode = 400;
        } else if (error.message === 'Email already exists') {
            statusCode = 409;
        }

        return errorResponse(statusCode, error.message);
    }
};
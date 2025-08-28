const UserModel = require('../models/user-model');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const logger = require('../../../../shared/utils/logger');

/**
 * User iş mantığı servisi
 */
class UserService {
    /**
     * Yeni kullanıcı oluşturur
     * @param {object} userData - Kullanıcı verisi
     * @returns {Promise<object>} Oluşturulan kullanıcı
     */
    static async createUser(userData) {
        try {
            // Validasyon
            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            // Email kontrolü
            const existingUsers = await UserModel.list();
            const emailExists = existingUsers.some(user => user.email === userData.email);
            
            if (emailExists) {
                throw new Error('Email already exists');
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Kullanıcı objesini oluştur
            const user = {
                userId: uuidv4(),
                email: userData.email,
                password: hashedPassword,
                name: userData.name || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Veritabanına kaydet
            return await UserModel.create(user);

        } catch (error) {
            logger.error('Error in createUser service', error);
            throw error;
        }
    }

    /**
     * Kullanıcı detaylarını getirir
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<object>} Kullanıcı bilgileri
     */
    static async getUser(userId) {
        try {
            const user = await UserModel.getById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Şifreyi response'tan kaldır
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;

        } catch (error) {
            logger.error('Error in getUser service', error);
            throw error;
        }
    }

    /**
     * Tüm kullanıcıları listeler
     * @returns {Promise<array>} Kullanıcı listesi
     */
    static async listUsers() {
        try {
            const users = await UserModel.list();
            
            // Şifreleri kaldır
            return users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

        } catch (error) {
            logger.error('Error in listUsers service', error);
            throw error;
        }
    }

    /**
     * Kullanıcı bilgilerini günceller
     * @param {string} userId - Kullanıcı ID'si
     * @param {object} updates - Güncellenecek alanlar
     * @returns {Promise<object>} Güncellenmiş kullanıcı
     */
    static async updateUser(userId, updates) {
        try {
            // userId değiştirilemez
            if (updates.userId) {
                throw new Error('Cannot change userId');
            }

            // Şifre varsa hashle
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const updatedUser = await UserModel.update(userId, updates);
            
            // Şifreyi response'tan kaldır
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;

        } catch (error) {
            logger.error('Error in updateUser service', error);
            throw error;
        }
    }

    /**
     * Kullanıcıyı siler
     * @param {string} userId - Kullanıcı ID'si
     * @returns {Promise<boolean>} Silme işlemi başarılı mı
     */
    static async deleteUser(userId) {
        try {
            // Önce kullanıcının var olduğundan emin ol
            const user = await UserModel.getById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            return await UserModel.delete(userId);

        } catch (error) {
            logger.error('Error in deleteUser service', error);
            throw error;
        }
    }
}

module.exports = UserService;
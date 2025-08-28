/**
 * Başarılı API yanıtları için standart format
 * @param {number} statusCode - HTTP status kodu
 * @param {object} data - Yanıt verisi
 * @returns {object} Standart yanıt objesi
 */
function successResponse(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(data)
    };
}

/**
 * Hata yanıtları için standart format
 * @param {number} statusCode - HTTP status kodu
 * @param {string} message - Hata mesajı
 * @returns {object} Standart hata yanıtı
 */
function errorResponse(statusCode, message) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({ error: message })
    };
}

module.exports = {
    successResponse,
    errorResponse
};
module.exports = class Responder {

    /**
     * Base response wrapper, sends JSON response with message
     * 
     * @param {Response} res Response object
     * @param {number} code Code for HTTP header
     * @param {string} message Message to be sent
     */
    baseResponse(res, code, message = '') {
        let content = {
            'code' : code,
            'message' : message,
        };

        res
            .status(code)
            .json({
                content,
            });
    }

    /**
     * @param {Response} res 
     * @param {number} code 
     * @param {string} message 
     * @param {object} errors 
     */
    baseErrorResponse(res, code, message, errors = []) {
        let content = {
            'code' : code,
            'message' : message,
            'errors' : errors,
        }
        res
            .status(code)
            .json({
                content,
            });
    }

    /**
     * @param {Response} res 
     * @param {string} message 
     * @param {object} errors 
     */
    badRequestResponse(res, message = 'invalid request', errors = []) {
        this.baseErrorResponse(res, 400, message, errors);
    }

    /**
     * @param {Response} res 
     * @param {string} message 
     */
    unauthorizedResponse(res, message = 'unauthorized') {
        this.baseErrorResponse(res, 401, message);
    }
    
    /**
     * @param {Response} res 
     * @param {string} message 
     */
    notFoundResponse(res, message = 'not found') {
        this.baseErrorResponse(res, 404, message);
    }

    /**
     * @param {Response} res 
     * @param {string} message 
     */
    ohShitResponse(res, message = 'oh shit') {
        this.baseErrorResponse(res, 500, message);
    }

    /**
     * @param {Response} res 
     * @param {string} message 
     */
    successResponse(res, data = [], message = '') {
        let content = {
            'code' : 200,
            'message' : message,
            'data' : data,
        }

        res 
            .status(200)
            .json({
                content,
            });
    }

    /**
     * @param {Reponse} res 
     * @param {object} data 
     * @param {string} message 
     */
    itemCreatedResponse(res, data = [], message = '') {
        let content = {
            'code' : 201,
            'message' : message,
            'data' : data,
        };

        res 
            .status(201)
            .json({
                content,
            });
    }

    /**
     * @param {Reponse} res 
     * @param {object} data 
     * @param {string} message 
     */
    itemUpdatedResponse(res, data = [], message = '') {
        let content = {
            'code' : 202,
            'message' : message,
            'data' : data,
        };

        res 
            .status(202)
            .json({
                content,
            });
    }

    /**
     * @param {Response} res 
     * @param {object} data 
     * @param {string} message 
     */
    itemDeletedResponse(res) {
        res 
            .status(204)
            .json({});
    }
};
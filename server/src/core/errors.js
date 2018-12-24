/**
 * Node errors
 */
exports.NodeNotFoundError = class NodeNotFoundError extends Error {}
exports.NodePreviouslyServiced = class NodePreviouslyServiced extends Error {}

/**
 * Queue errors
 */
exports.QueueNotFoundError = class QueueNotFoundError extends Error {}
exports.QueueAtCapacityError = class QueueAtCapacityError extends Error {}
exports.QueueEmptyError = class QueueEmptyError extends Error {}

/**
 * User errors
 */
exports.UserAlreadyExistsError = class UserAlreadyExistsError extends Error {}
exports.UserNotFoundError = class UserNotFoundError extends Error {}

/**
 * Validation errors
 */
exports.ValidationFailedError = class ValidationFailedError extends Error {
    constructor(errors = [], ...params) {
        super(...params);
        this.errors = errors;
    }
}

/**
 * Encryption errors
 */
exports.EncryptionFailedError = class EncryptionFailedError extends Error {}
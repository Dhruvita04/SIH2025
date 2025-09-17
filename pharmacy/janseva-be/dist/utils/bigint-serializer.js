"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBigInt = serializeBigInt;
function serializeBigInt(data) {
    if (data === null || data === undefined) {
        return data;
    }
    if (typeof data === 'bigint') {
        return data.toString();
    }
    if (Array.isArray(data)) {
        return data.map(item => serializeBigInt(item));
    }
    if (typeof data === 'object') {
        const result = {};
        for (const key in data) {
            result[key] = serializeBigInt(data[key]);
        }
        return result;
    }
    return data;
}
//# sourceMappingURL=bigint-serializer.js.map
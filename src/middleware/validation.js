const isValid = function(value) {
    if (typeof(value) === 'undefined' || typeof(value) === null) {
        return false
    }
    if (typeof(value) === "number" && (value).toString().trim().length > 0) {
        return true
    }
    if (typeof(value) === "string" && (value).trim().length > 0) {
        return true
    }

}


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(uuid) {
    return uuidPattern.test(uuid);
  }

module.exports = {isValid, isValidRequestBody, isValidUUID}



"use strict";
function SequelizeError(code, error) {
    Error.call(this, typeof error === "undefined" ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "SequelizeError";
    this.message = typeof error === "undefined" ? undefined : error.message;
    this.code = typeof code === "undefined" ? "422" : code;
    this.status = 422;
    this.inner = error;
}

SequelizeError.prototype = Object.create(Error.prototype);
SequelizeError.prototype.constructor = SequelizeError;

module.exports = SequelizeError;

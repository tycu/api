"use strict";
function StripeError(code, error) {
    Error.call(this, typeof error === "undefined" ? undefined : error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "StripeError";
    this.message = typeof error === "undefined" ? undefined : error.message;
    this.code = typeof code === "undefined" ? "400" : code;
    this.status = 400;
    this.inner = error;
}

StripeError.prototype = Object.create(Error.prototype);
StripeError.prototype.constructor = StripeError;

module.exports = StripeError;



// var handleStripeError = function(err, res) {
//   if (err.rawType == 'card_error' && err.message) {
//     res.status(400).json({
//       'error': {
//         'message': err.message
//       }
//     })
//   } else {
//     res.sendStatus(400)
//     console.error(err)
//   }
// }
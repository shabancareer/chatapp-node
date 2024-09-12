class CustomError extends Error {
  /**
   * Custom Error Constructor with additional methods
   * @param {any} [message] - Optional error payload
   * @param {number} [statusCode] - Optional error http status code
   * @param {string} [feedback=""] - Optional feedback message you want to provide
   */
  constructor(message, statusCode, feedback = "") {
    let errorMessage = "";
    if (Array.isArray(message)) {
      errorMessage = message.map((err) => err.msg).join(", ");
    } else {
      errorMessage = message;
    }
    super(errorMessage);
    this.name = "CustomError";
    this.status = statusCode;
    this.cause = message;
    this.feedback = String(feedback);
  }
}

export default CustomError;

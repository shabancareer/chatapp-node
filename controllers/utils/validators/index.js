import * as authValidators from "./auth-validators.js";
import * as userValidators from "./user-validators.js";

export default {
  ...authValidators,
  ...userValidators,
};

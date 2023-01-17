import {errorHelper} from "../utils/index.js";
import constants from "../constants/index.js";

export default async (req, res, next) => {
    let cartToken = req.params.token;
    if (!cartToken) {
        return res.status(400).json(errorHelper(400, req, constants.notFoundCartToken));
    }
    req.cartToken = cartToken;
    next()
};

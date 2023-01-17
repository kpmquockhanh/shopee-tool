import {errorHelper} from "../utils/index.js";
import constants from "../constants/index.js";

export default async (req, res, next) => {
    let token = req.header('access-token');
    if (!token) {
        return res.status(401).json(errorHelper(401, req, constants.unauthorized));
    }
    req.token = token;
    next()
};

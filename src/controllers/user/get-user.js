import { User } from '../../models/index.js';
import {
  errorHelper, getText, genB2Link, logger,
} from '../../utils/index.js';

export default async (req, res) => {
  const user = await User
    .findById(req.user._id)
    .populate('photo')
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions',
      },
    })
    .populate('permissions')
    .catch((err) => {
      logger('00089', req.user._id, getText('en', '00089'), 'Error', req);
      return res.status(500).json(errorHelper('00088', req, err.message));
    });

  return res.status(200).json({
    resultMessage: { en: getText('en', '00089') },
    resultCode: '00089',
    user: { ...user.toJSON(), photoUrl: genB2Link(user.photo?.src) },
  });
};

/**
 * @swagger
 * /user:
 *    get:
 *      summary: Get User Info
 *      parameters:
 *        - in: header
 *          name: Authorization
 *          schema:
 *            type: string
 *          description: Put access token here
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: The user information has gotten successfully.
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          resultMessage:
 *                              $ref: '#/components/schemas/ResultMessage'
 *                          resultCode:
 *                              $ref: '#/components/schemas/ResultCode'
 *                          user:
 *                              $ref: '#/components/schemas/User'
 *        "401":
 *          description: Invalid token.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 *        "500":
 *          description: An internal server error occurred, please try again.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
 */

import sizeOf from 'buffer-image-size';
import { Attachment, User } from '../../../models/index.js';
import { validateEditUser } from '../../../validators/user.validator.js';
import {
  errorHelper, logger, getText, genB2Link,
} from '../../../utils/index.js';
import {
  blackblazeBucketId,
} from '../../../config/index.js';

export default async (req, res) => {
  const { error } = validateEditUser(req.body);
  if (error) {
    let code = '00077';
    const { message } = error.details[0];
    if (message.includes('gender')) code = '00078';
    else if (message.includes('language')) code = '00079';
    else if (message.includes('birthDate')) code = '00080';
    else if (message.includes('username')) code = '00081';
    return res.status(400).json(errorHelper(code, req, message));
  }

  const user = await User
    .findById(req.user._id)
    .populate('photo')
    .catch((err) => res.status(500).json(errorHelper('00082', req, err.message)));

  if (req.body.name) user.name = req.body.name;
  if (req.body.gender) user.gender = req.body.gender;
  if (req.body.birthDate) user.birthDate = req.body.birthDate;
  if (req.body.language) user.language = req.body.language;
  if (req.body.username && req.body.username !== user.username) {
    const exist = await User.exists({ username: req.body.username }).catch((err) => res.status(500).json(errorHelper('00083', req, err.message)));
    if (exist) return res.status(400).json(errorHelper('00084', req));

    user.username = req.body.username;
  }
  if (req.file) {
    try {
      const b2 = req.app.get('b2');
      const { uploadUrl, authorizationToken: uploadAuthToken } = (await b2.getUploadUrl({
        bucketId: blackblazeBucketId,
      })).data;
      // Try to remove the old photo from the bucket
      if (user.photo) {
        const oldPhoto = user.photo;
        await b2.deleteFileVersion({
          fileId: oldPhoto.refId,
          fileName: oldPhoto.src,
        });
        // Delete the old photo from the database
        await Attachment.deleteOne({ _id: oldPhoto._id });
      }
      const dimensions = sizeOf(req.file.buffer);

      const resp = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken,
        fileName: `${Date.now()}_${req.file.originalname}`,
        data: req.file.buffer,
        contentLength: req.file.size,
      });

      const attachment = new Attachment({
        name: 'Profile Photo',
        src: resp.data.fileName,
        type: 'profile_image',
        createdBy: req.user._id,
        refId: resp.data.fileId,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
      });
      await attachment.save();

      user.photo = attachment._id;
      await user.save();
      logger('00086', req.user._id, getText('en', '00086'), 'Info', req);
      return res.status(200).json({
        resultMessage: { en: getText('en', '00086'), tr: getText('tr', '00086') },
        resultCode: '00086',
        photoUrl: genB2Link(resp.data.fileName),
      });
    } catch (err) {
      return res.status(500).json(errorHelper('00087', req, err.message)).end();
    }
  }
  await user.save();
  logger('00086', req.user._id, getText('en', '00086'), 'Info', req);
  return res.status(200).json({
    resultMessage: { en: getText('en', '00086'), tr: getText('tr', '00086') },
    resultCode: '00086',
  });
};

/**
 * @swagger
 * /user:
 *    put:
 *      summary: Edit the Profile Information
 *      parameters:
 *        - in: header
 *          name: Authorization
 *          schema:
 *            type: string
 *          description: Put access token here
 *        - in: formData
 *          name: image
 *          required: false
 *          schema:
 *            type: file
 *          description: Image file here
 *      requestBody:
 *        description: Some of the user profile information to change
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                username:
 *                  type: string
 *                language:
 *                  type: string
 *                  enum: ['tr', 'en']
 *                gender:
 *                  type: string
 *                  enum: ['male', 'female', 'other']
 *                birthDate:
 *                  type: string
 *      tags:
 *        - User
 *      responses:
 *        "200":
 *          description: Your profile information was changed successfully.
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          resultMessage:
 *                              $ref: '#/components/schemas/ResultMessage'
 *                          resultCode:
 *                              $ref: '#/components/schemas/ResultCode'
 *                          photoUrl:
 *                              type: string
 *        "400":
 *          description: Please provide valid values for each key you want to change.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Result'
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

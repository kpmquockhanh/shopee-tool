import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import geoip from 'geoip-lite';
import { Token, User } from '../../../models/index.js';
import {
  errorHelper, generateRandomCode, getText, logger, signAccessToken, signRefreshToken,
} from '../../../utils/index.js';
import ipHelper from '../../../utils/helpers/ip-helper.js';
import { googleClientId } from '../../../config/index.js';

export default async (req, res) => {
  const client = new OAuth2Client(googleClientId);

  // Call this function to validate the JWT credential sent from client-side
  async function verifyCredentials(credential) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
    });
    return ticket.getPayload();
  }

  const userInfo = await verifyCredentials(req.body.code);
  if (!userInfo.email) {
    return res.status(401).json(errorHelper('00043', req));
  }

  let user = await User
    .findOne({ email: userInfo.email, isActivated: true, isVerified: true })
    .populate('photo')
    .catch((err) => res.status(500).json(errorHelper('00041', req, err.message)));

  if (!user) {
    const { hash } = bcrypt;
    const { lookup } = geoip;
    const geo = lookup(ipHelper(req));
    const hashed = await hash(generateRandomCode(10), 10);
    const newUser = new User({
      email: userInfo.email,
      password: hashed,
      name: userInfo.name,
      username: userInfo.email,
      language: 'en',
      platform: 'Web',
      isVerified: true,
      isActivated: true,
      countryCode: geo == null ? 'US' : geo.country,
      timezone: req.body.timezone,
      lastLogin: Date.now(),
    });

    user = await newUser.save().catch((err) => res.status(500).json(errorHelper('00034', req, err.message)));
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  // NOTE: 604800000 ms is equal to 7 days. So, the expiry date of the token is 7 days after.
  await Token.updateOne(
    { userId: user._id },
    {
      $set: {
        refreshToken,
        status: true,
        expiresIn: Date.now() + 604800000,
        createdAt: Date.now(),
      },
    },
  ).catch((err) => res.status(500).json(errorHelper('00046', req, err.message)));

  logger('00047', user._id, getText('en', '00047'), 'Info', req);
  return res.status(200).json({
    resultMessage: { en: getText('en', '00047') },
    resultCode: '00047',
    user,
    accessToken,
    refreshToken,
  });
};

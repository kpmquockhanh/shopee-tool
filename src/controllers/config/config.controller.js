import { User } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';
import loadTranslations from '../../utils/helpers/translation-helper.js';

const getUserConfig = async (req, res) => {
  try {
    // Load translations for available languages
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'vi', name: 'Vietnamese' },
    ];

    const translations = {};
    languages.forEach((lang) => {
      translations[lang.code] = loadTranslations(lang.code);
    });

    let user = {};
    if (req.user) {
      user = await User.findById(req.user._id)
        .select('name email isAdmin roles permissions')
        .populate({
          path: 'roles',
          populate: {
            path: 'permissions',
          },
        })
        .populate('permissions');

      if (!user) {
        return res.status(404).json(errorHelper('00023', req, 'User not found'));
      }
    }

    return res.status(200).json({
      code: 200,
      data: {
        can_delete: false,
        can_edit: false,
        can_reply: true,
        country: 'US',
        languages,
        translations,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          is_admin: user.isAdmin || false,
          roles: user.roles,
          permissions: user.permissions,
        },
      },
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00024', req, err.message));
  }
};

export default { getUserConfig };

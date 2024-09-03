import { User } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';

export const can = (permission) => async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('permissions')
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions',
      },
    })
    .catch((err) => res.status(500).json(errorHelper('00020', req, err.message)));

  if (!user) return res.status(404).json(errorHelper('00020', req, 'User not found'));

  if (user.roles.some((role) => role.name.toLowerCase() === 'sadmin')) return next();

  const allRolesPermissions = user.roles.map((role) => role.permissions).flat().map((p) => p.name);
  const directPermissions = user.permissions.map((p) => p.name);
  const permissions = [...allRolesPermissions, ...directPermissions];
  if (!permissions.includes(permission)) return res.status(403).json(errorHelper('00021', req, `You have not '${permission}' permission`));

  next();
  return null;
};

export const is = (role) => async (req, res, next) => {
  const user = await User.findById(req.user._id).select('type')
    .catch((err) => res.status(500).json(errorHelper('00020', req, err.message)));

  if (user.hasRole(role)) return res.status(403).json(errorHelper('00021', req, 'You have not permission'));

  next();
  return null;
};

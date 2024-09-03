import merge from 'lodash/merge.js';
import pick from 'lodash/pick.js';
import { User, Role, Permission } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';
import {
  validateAssignRole,
  validateCreatePermission,
  validateCreateRole,
} from '../../validators/role_permission.validator.js';

const getPermissionsByUser = (user) => merge(user.permissions, user.roles.permissions)
  .map((permission) => ({
    name: permission.name,
  }));
export const getAllPermissions = async (req, res) => {
  const user = await User.findById(req.user._id).populate(['roles.permissions', 'permissions']);
  if (!user) return errorHelper('00001', req, 'User not found');

  const roles = await Role.find();
  const permissions = await Permission.find();
  // Get hidden permissions
  const existPermissions = getPermissionsByUser(user);

  return res.json({
    roles,
    permissions: [...permissions, ...existPermissions].map((permission) => ({
      name: permission.name,
      id: permission._id,
    })),
  });
};

export const addPermissions = async (req, res) => {
  const { error } = validateCreatePermission(req.body);
  if (error) return res.status(400).json(errorHelper('00066', req, error.details[0].message));

  const user = await User.findById(req.user._id);
  if (!user) return errorHelper('00001', req, 'User not found');
  const payload = pick(req.body, ['name', 'description']);

  const existPermission = await Permission.exists({ name: payload.name });
  if (existPermission) return res.status(400).json(errorHelper('00065', req, 'Permission already exists'));
  const newPermission = new Permission(payload);
  newPermission.createdBy = req.user._id;
  await newPermission.save();
  return res.json({
    permissions: newPermission,
  });
};

export const addRole = async (req, res) => {
  const { error } = validateCreateRole(req.body);
  if (error) return res.status(400).json(errorHelper('00066', req, error.details[0].message));

  const user = await User.findById(req.user._id);
  if (!user) return errorHelper('00001', req, 'User not found');
  const payload = pick(req.body, ['name', 'description']);

  const existRole = await Role.exists({ name: payload.name });
  if (existRole) return res.status(400).json(errorHelper('00065', req, 'Role already exists'));

  const newRole = new Role(payload);
  newRole.createdBy = req.user._id;
  await newRole.save();
  return res.json({
    role: newRole,
  });
};

export const updatePermissions = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return errorHelper('00001', req, 'User not found');

  // user.assignRole({
  //   name: 'Admin',
  //   permissions: [
  //     {
  //       name: 'view-permissions',
  //     },
  //   ],
  // });

  // user.revokeRole('Admin');

  return res.json({});
};

export const getOwnedPermissions = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return errorHelper('00001', req, 'User not found');
  return res.json({
    roles: user.roles,
    permissions: getPermissionsByUser(user),
  });
};

export const deletePermission = async (req, res) => {
  const permission = await Permission.findByIdAndDelete(req.params.permission_id);
  if (!permission) return res.status(404).json(errorHelper('00002', req, 'Permission not found'));
  return res.json({});
};

export const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.role_id);
  if (!role) return res.status(404).json(errorHelper('00002', req, 'Role not found'));

  if (role.name.toLowerCase() === 'sadmin') {
    return res.status(403).json(errorHelper('00021', req, 'Can not delete s-admin permission'));
  }
  role.remove();
  return res.json({});
};

export const updateRole = async (req, res) => {
  const { error } = validateCreateRole(req.body);
  if (error) return res.status(400).json(errorHelper('00066', req, error.details[0].message));

  const user = await User.findById(req.user._id);
  if (!user) return errorHelper('00001', req, 'User not found');

  const role = await Role.findById(req.params.role_id);
  if (!role) return res.status(404).json(errorHelper('00002', req, 'Role not found'));

  const payload = pick(req.body, [
    // 'name',
    // 'description',
    'permissions']);

  const permissionsExist = await Permission.find({ _id: { $in: payload.permissions } });
  role.permissions = permissionsExist.map((permission) => permission._id);
  await role.save();
  return res.json({ });
};

export const assignRole = async (req, res) => {
  const { error } = validateAssignRole(req.body);
  if (error) return res.status(400).json(errorHelper('00066', req, error.details[0].message));

  const { user_id, role_id, action } = req.body;

  const user = await User.findById(user_id);
  if (!user) return errorHelper('00001', req, 'User not found');

  const role = await Role.findById(role_id);
  if (!role) return res.status(404).json(errorHelper('00002', req, 'Role not found'));

  if (action === 'assign') {
    User.findByIdAndUpdate(
      user_id,
      {
        $push: {
          roles: role_id,
        },
      },
      { new: true },
    ).catch((err) => res.status(500).json(errorHelper('00020', req, err.message)));
  } else if (action === 'revoke') {
    User.findByIdAndUpdate(
      user_id,
      {
        $pull: {
          roles: role_id,
        },
      },
      { new: true },
    ).catch((err) => res.status(500).json(errorHelper('00020', req, err.message)));
  }
  return res.json({});
};

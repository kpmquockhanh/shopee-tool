import { Router } from 'express';
import {
  addPermissions,
  addRole, assignRole,
  deletePermission,
  deleteRole,
  getAllPermissions,
  getOwnedPermissions,
  updatePermissions,
  updateRole,
  getAllUsers,
} from '../../controllers/permissions/permission.controller.js';
import { auth } from '../../middlewares/index.js';
import { can } from '../../middlewares/auth/check-permission.js';

const router = Router();

router.get('/', auth, can('permissions'), getAllPermissions);
router.get('/owned', auth, can('permissions'), getOwnedPermissions);
router.put('/', auth, can('permissions'), updatePermissions);
router.post('/', auth, can('permissions'), addPermissions);
router.post('/role', auth, can('permissions'), addRole);

router.delete('/:permission_id', auth, can('permissions'), deletePermission);
router.delete('/role/:role_id', auth, can('permissions'), deleteRole);
router.put('/role/:role_id', auth, can('permissions'), updateRole);
router.put('/assign', auth, can('permissions'), assignRole);
router.get('/users', auth, can('permissions'), getAllUsers);

export default router;

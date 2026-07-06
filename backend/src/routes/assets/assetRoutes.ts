import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
} from '../../controllers/assetController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

// Enforce auth on all asset routes
router.use(authenticate);

// Asset CRUD and Assignment paths
router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createAsset));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getAssets));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getAssetById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateAsset));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteAsset));

router.post('/assign', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(assignAsset));
router.post('/:id/return', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(returnAsset));

export default router;

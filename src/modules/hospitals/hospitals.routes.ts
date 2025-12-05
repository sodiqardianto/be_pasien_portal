import { Router } from 'express';
import { HospitalsController } from './hospitals.controller';
import { createHospitalDto, updateHospitalDto } from './hospitals.dto';
import { validate, authenticate, authorize } from '../../shared/middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/hospitals:
 *   post:
 *     summary: Create new hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - phone
 *               - address
 *               - latitude
 *               - longitude
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Hospital created successfully
 */
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createHospitalDto),
  HospitalsController.create
);

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 */
router.get('/', authenticate, HospitalsController.findAll);

/**
 * @swagger
 * /api/hospitals/{id}:
 *   get:
 *     summary: Get hospital by ID
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hospital retrieved successfully
 */
router.get('/:id', authenticate, HospitalsController.findById);

/**
 * @swagger
 * /api/hospitals/{id}:
 *   put:
 *     summary: Update hospital
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 */
router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateHospitalDto),
  HospitalsController.update
);

/**
 * @swagger
 * /api/hospitals/{id}:
 *   delete:
 *     summary: Delete hospital (soft delete)
 *     tags: [Hospitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hospital deleted successfully
 */
router.delete('/:id', authenticate, authorize(Role.ADMIN), HospitalsController.delete);

export default router;

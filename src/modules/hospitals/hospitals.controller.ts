import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../shared/utils/response.util';
import { HospitalsService } from './hospitals.service';

export class HospitalsController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospital = await HospitalsService.create(req.body);
      return ResponseHandler.created(res, 'Hospital created successfully', hospital);
    } catch (error) {
      next(error);
    }
  }

  static async findAll(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospitals = await HospitalsService.findAll();
      return ResponseHandler.success(res, 'Hospitals retrieved successfully', hospitals);
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospital = await HospitalsService.findById(req.params.id);
      return ResponseHandler.success(res, 'Hospital retrieved successfully', hospital);
    } catch (error) {
      if (error instanceof Error && error.message === 'Hospital not found') {
        return ResponseHandler.notFound(res, 'Hospital not found');
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const hospital = await HospitalsService.update(req.params.id, req.body);
      return ResponseHandler.success(res, 'Hospital updated successfully', hospital);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      await HospitalsService.delete(req.params.id);
      return ResponseHandler.success(res, 'Hospital deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

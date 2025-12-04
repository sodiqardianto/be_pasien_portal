import { prisma } from '../../shared/utils/prisma.util';
import { CreateHospitalDto, UpdateHospitalDto } from './hospitals.dto';
import { HospitalResponse } from './hospitals.types';

export class HospitalsService {
  static async create(data: CreateHospitalDto): Promise<HospitalResponse> {
    const hospital = await prisma.hospital.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        email: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return hospital;
  }

  static async findAll(): Promise<HospitalResponse[]> {
    const hospitals = await prisma.hospital.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        email: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return hospitals;
  }

  static async findById(id: string): Promise<HospitalResponse> {
    const hospital = await prisma.hospital.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        email: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!hospital) {
      throw new Error('Hospital not found');
    }

    return hospital;
  }

  static async update(id: string, data: UpdateHospitalDto): Promise<HospitalResponse> {
    const hospital = await prisma.hospital.update({
      where: { id, deletedAt: null },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        email: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return hospital;
  }

  static async delete(id: string): Promise<void> {
    await prisma.hospital.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

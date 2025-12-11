import { prisma } from '../../../shared/utils/prisma.util';

/**
 * Hospital Functions for AI Chatbot
 * These functions are called by AI when user asks about hospital information
 */

/**
 * Get all hospitals information
 */
export async function getAllHospitals() {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        address: true,
        email: true,
        website: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { name: 'asc' },
    });

    console.log(`✅ Found ${hospitals.length} hospital(s)`);
    return hospitals;
  } catch (error) {
    console.error('❌ Error getting hospitals:', error);
    return [];
  }
}

/**
 * Get specific hospital by name or location
 */
export async function getHospitalByLocation(location: string) {
  try {
    const hospital = await prisma.hospital.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        phone: true,
        address: true,
        email: true,
        website: true,
        latitude: true,
        longitude: true,
      },
    });

    if (hospital) {
      console.log(`✅ Found hospital: ${hospital.name}`);
    } else {
      console.log(`⚠️ No hospital found for location: "${location}"`);
    }

    return hospital;
  } catch (error) {
    console.error('❌ Error getting hospital by location:', error);
    return null;
  }
}

/**
 * Get hospital contact information
 */
export async function getHospitalContact(location?: string) {
  try {
    if (location) {
      const hospital = await prisma.hospital.findFirst({
        where: {
          deletedAt: null,
          name: { contains: location, mode: 'insensitive' },
        },
        select: {
          name: true,
          phone: true,
          email: true,
          website: true,
        },
      });

      console.log(`✅ Found contact for: ${hospital?.name || 'unknown'}`);
      return hospital;
    }

    // Get all hospital contacts
    const hospitals = await prisma.hospital.findMany({
      where: { deletedAt: null },
      select: {
        name: true,
        phone: true,
        email: true,
        website: true,
      },
      orderBy: { name: 'asc' },
    });

    console.log(`✅ Found ${hospitals.length} hospital contact(s)`);
    return hospitals;
  } catch (error) {
    console.error('❌ Error getting hospital contact:', error);
    return null;
  }
}

/**
 * Tool definitions for OpenAI/DeepSeek function calling
 */
export const hospitalTools = [
  {
    type: 'function',
    function: {
      name: 'getAllHospitals',
      description:
        'Get information about all Bethsaida Hospital locations. Use this when user asks about hospital locations, addresses, or wants to see all available hospitals.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getHospitalByLocation',
      description:
        'Get specific hospital information by location name (e.g., "Gading Serpong", "Serang"). Use this when user asks about a specific hospital location.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description:
              'Location name or area (e.g., "Gading Serpong", "Serang", "Tangerang")',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getHospitalContact',
      description:
        'Get hospital contact information (phone, email, website). Use this when user asks for phone number, email, or how to contact the hospital. Can be filtered by location.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description:
              'Optional: specific location name (e.g., "Gading Serpong"). If not provided, returns all hospital contacts.',
          },
        },
      },
    },
  },
];

/**
 * Function executor - maps function name to actual function
 */
export async function executeHospitalFunction(
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  switch (functionName) {
    case 'getAllHospitals':
      return await getAllHospitals();
    case 'getHospitalByLocation':
      return await getHospitalByLocation(args.location);
    case 'getHospitalContact':
      return await getHospitalContact(args.location);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

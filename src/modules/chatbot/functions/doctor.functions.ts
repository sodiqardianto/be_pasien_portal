import { connectSqlServer, querySqlServerWithParams } from '../../../shared/utils/sqlserver.util';

/**
 * Doctor Functions for AI Chatbot
 * These functions are called by AI when user asks about doctors
 */

/**
 * Search dokter by name di SQL Server
 */
export async function searchDoctor(doctorName: string) {
  try {
    await connectSqlServer();

    const query = `
      SELECT TOP 10
        Doctor_Code,
        Doctor_Name,
        Doctor_Display,
        Home_Address,
        Active
      FROM DB_Master_Fix.dbo.dokter
      WHERE (Doctor_Name LIKE '%' + @doctorName + '%'
         OR Doctor_Display LIKE '%' + @doctorName + '%')
        AND Active = 1
      ORDER BY Doctor_Name
    `;

    const results = await querySqlServerWithParams(query, {
      doctorName: doctorName.toUpperCase(),
    });

    console.log(`✅ Found ${results.length} doctor(s) for "${doctorName}"`);
    return results;
  } catch (error) {
    console.error('❌ Error searching doctor:', error);
    return [];
  }
}

/**
 * Get list dokter aktif
 */
export async function getActiveDoctors() {
  try {
    await connectSqlServer();

    const query = `
      SELECT TOP 20
        Doctor_Code,
        Doctor_Name,
        Doctor_Display,
        Active
      FROM DB_Master_Fix.dbo.dokter
      WHERE Active = 1
      ORDER BY Doctor_Name
    `;

    const results = await querySqlServerWithParams(query, {});
    console.log(`✅ Found ${results.length} active doctor(s)`);
    return results;
  } catch (error) {
    console.error('❌ Error getting active doctors:', error);
    return [];
  }
}

/**
 * Get doctor by specialization (future implementation)
 */
export async function getDoctorBySpecialization(specialization: string) {
  try {
    await connectSqlServer();

    const query = `
      SELECT TOP 10
        Doctor_Code,
        Doctor_Name,
        Doctor_Display,
        Active
      FROM DB_Master_Fix.dbo.dokter
      WHERE Doctor_Display LIKE '%' + @specialization + '%'
        AND Active = 1
      ORDER BY Doctor_Name
    `;

    const results = await querySqlServerWithParams(query, {
      specialization: specialization.toUpperCase(),
    });

    console.log(`✅ Found ${results.length} doctor(s) with specialization "${specialization}"`);
    return results;
  } catch (error) {
    console.error('❌ Error getting doctors by specialization:', error);
    return [];
  }
}

/**
 * Tool definitions for OpenAI/DeepSeek function calling
 */
export const doctorTools = [
  {
    type: 'function',
    function: {
      name: 'searchDoctor',
      description:
        'Search for doctors by name in the hospital database. Use this when user asks about specific doctor availability or wants to find a doctor by name.',
      parameters: {
        type: 'object',
        properties: {
          doctorName: {
            type: 'string',
            description: 'The name of the doctor to search for (can be partial name)',
          },
        },
        required: ['doctorName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getActiveDoctors',
      description:
        'Get list of all active doctors in the hospital. Use this when user asks for list of available doctors or wants to see all doctors.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDoctorBySpecialization',
      description:
        'Get doctors filtered by medical specialization (e.g., Sp.A for pediatrics, Sp.PD for internal medicine). Use this when user asks for doctors with specific specialization.',
      parameters: {
        type: 'object',
        properties: {
          specialization: {
            type: 'string',
            description:
              'Medical specialization code or name (e.g., "Sp.A", "Sp.PD", "Sp.OG", "pediatri", "anak")',
          },
        },
        required: ['specialization'],
      },
    },
  },
];

/**
 * Function executor - maps function name to actual function
 */
export async function executeDoctorFunction(
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  switch (functionName) {
    case 'searchDoctor':
      return await searchDoctor(args.doctorName);
    case 'getActiveDoctors':
      return await getActiveDoctors();
    case 'getDoctorBySpecialization':
      return await getDoctorBySpecialization(args.specialization);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

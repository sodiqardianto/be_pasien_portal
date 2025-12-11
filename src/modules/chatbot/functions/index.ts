/**
 * Chatbot Functions Index
 * 
 * This file exports all AI functions and tools for the chatbot.
 * Add new function modules here as the chatbot capabilities expand.
 */

import {
  searchDoctor,
  getActiveDoctors,
  getDoctorBySpecialization,
  doctorTools,
  executeDoctorFunction,
} from './doctor.functions';

import {
  getAllHospitals,
  getHospitalByLocation,
  getHospitalContact,
  hospitalTools,
  executeHospitalFunction,
} from './hospital.functions';

// Export individual functions
export { searchDoctor, getActiveDoctors, getDoctorBySpecialization };
export { getAllHospitals, getHospitalByLocation, getHospitalContact };

// Export all tools combined
export const allTools = [...doctorTools, ...hospitalTools];

// Export function executors
export const functionExecutors = {
  doctor: executeDoctorFunction,
  hospital: executeHospitalFunction,
  // Add more executors here as needed
  // appointment: executeAppointmentFunction,
};

/**
 * Main function executor
 * Routes function calls to appropriate executor based on function name
 */
export async function executeFunction(
  functionName: string,
  args: Record<string, any>
): Promise<any> {
  // Doctor functions
  if (
    functionName === 'searchDoctor' ||
    functionName === 'getActiveDoctors' ||
    functionName === 'getDoctorBySpecialization'
  ) {
    return await executeDoctorFunction(functionName, args);
  }

  // Hospital functions
  if (
    functionName === 'getAllHospitals' ||
    functionName === 'getHospitalByLocation' ||
    functionName === 'getHospitalContact'
  ) {
    return await executeHospitalFunction(functionName, args);
  }

  // Add more function categories here
  // if (functionName === 'bookAppointment') {
  //   return await executeAppointmentFunction(functionName, args);
  // }

  throw new Error(`Unknown function: ${functionName}`);
}

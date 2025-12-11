# Chatbot Functions

Folder ini berisi function definitions untuk AI chatbot function calling.

## Struktur

```
functions/
├── index.ts                 # Main export & function executor
├── doctor.functions.ts      # Doctor-related functions
└── README.md               # This file
```

## Cara Kerja

### 1. Define Functions

Setiap file function module berisi:
- **Function implementations**: Actual logic untuk query database
- **Tool definitions**: Schema untuk AI function calling
- **Function executor**: Router untuk execute functions

### 2. Register di Index

File `index.ts` mengumpulkan semua tools dan executors:
```typescript
export const allTools = [...doctorTools, ...hospitalTools];
```

### 3. Service Menggunakan Functions

`chatbot.service.ts` import dan gunakan:
```typescript
import { allTools, executeFunction } from './functions';

// AI akan call function otomatis
const response = await openai.chat.completions.create({
  tools: allTools,
  ...
});

// Execute function
const result = await executeFunction(functionName, args);
```

## Menambah Function Baru

### Step 1: Buat File Function Module

Contoh: `appointment.functions.ts`

```typescript
import { connectSqlServer, querySqlServerWithParams } from '../../../shared/utils/sqlserver.util';

export async function checkDoctorSchedule(doctorCode: string, date: string) {
  // Implementation
}

export const appointmentTools = [
  {
    type: 'function',
    function: {
      name: 'checkDoctorSchedule',
      description: 'Check doctor schedule for specific date',
      parameters: {
        type: 'object',
        properties: {
          doctorCode: { type: 'string' },
          date: { type: 'string' },
        },
        required: ['doctorCode', 'date'],
      },
    },
  },
];

export async function executeAppointmentFunction(
  functionName: string,
  args: Record<string, any>
) {
  switch (functionName) {
    case 'checkDoctorSchedule':
      return await checkDoctorSchedule(args.doctorCode, args.date);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}
```

### Step 2: Register di `index.ts`

```typescript
import { appointmentTools, executeAppointmentFunction } from './appointment.functions';

export const allTools = [
  ...doctorTools,
  ...appointmentTools, // Add here
];

export async function executeFunction(functionName: string, args: any) {
  // Add routing
  if (functionName === 'checkDoctorSchedule') {
    return await executeAppointmentFunction(functionName, args);
  }
  
  // ... existing code
}
```

### Step 3: Update System Prompt (Optional)

Di `chatbot.service.ts`, tambahkan instruksi untuk function baru:
```typescript
const systemPrompt = `...
- Gunakan checkDoctorSchedule() untuk cek jadwal dokter
...`;
```

## Best Practices

### 1. Function Naming
- Use camelCase: `searchDoctor`, `getActiveDoctors`
- Be descriptive: `getDoctorBySpecialization` not `getDoctors`
- Verb + Noun: `checkSchedule`, `bookAppointment`

### 2. Error Handling
```typescript
export async function searchDoctor(name: string) {
  try {
    // Implementation
  } catch (error) {
    console.error('Error:', error);
    return []; // Return empty array, not throw
  }
}
```

### 3. Logging
```typescript
console.log(`✅ Found ${results.length} doctor(s)`);
console.error('❌ Error searching doctor:', error);
```

### 4. Tool Description
- Be specific about when to use the function
- Include examples in description
- List all parameters clearly

### 5. Return Format
- Always return consistent format (array, object)
- Handle empty results gracefully
- Don't return null, use empty array/object

## Function Ideas

### Doctor Functions ✅
- [x] searchDoctor
- [x] getActiveDoctors
- [x] getDoctorBySpecialization
- [ ] getDoctorSchedule
- [ ] getDoctorReviews

### Appointment Functions
- [ ] checkAvailability
- [ ] bookAppointment
- [ ] cancelAppointment
- [ ] rescheduleAppointment

### Hospital Functions
- [ ] getHospitalInfo
- [ ] getDepartments
- [ ] getFacilities
- [ ] getEmergencyContact

### Medical Records Functions
- [ ] getPatientHistory (with auth)
- [ ] getPrescriptions (with auth)
- [ ] getLabResults (with auth)

## Testing

Test individual functions:
```typescript
import { searchDoctor } from './doctor.functions';

const results = await searchDoctor('Yuliana');
console.log(results);
```

Test with chatbot:
```bash
POST /api/chatbot/message
{
  "message": "Apakah ada dokter Yuliana?"
}
```

## Security Notes

- Always validate function parameters
- Use parameterized queries (already handled by `querySqlServerWithParams`)
- Don't expose sensitive data in function results
- Add authentication check for sensitive functions
- Rate limit function calls if needed

## Performance Tips

- Add caching for frequently called functions
- Limit result size (TOP 10, TOP 20)
- Use indexes on database columns
- Consider connection pooling (already handled by mssql)

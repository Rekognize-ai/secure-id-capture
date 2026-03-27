// Mock data for admin dashboard when real data is unavailable
import { format, subDays, subMonths } from 'date-fns';

export const FACILITIES = [
  'Central Correctional',
  'Westfield Penitentiary',
  'Eastgate Detention Center',
  'Northpoint Correctional',
  'Southside Facility',
] as const;

export const CELL_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

const firstNames = ['James', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = subDays(new Date(), Math.floor(Math.random() * daysBack));
  return d.toISOString();
}

export type MockInmate = {
  id: string;
  inmateId: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  facility: string;
  cellBlock: string;
  cellNumber: string;
  enrollmentDate: string;
  status: 'active' | 'transferred' | 'released' | 'pending';
  lastUpdated: string;
  admissionDate: string;
  profilePhoto: string;
  notes: string;
  auditTrail: { date: string; action: string; user: string }[];
};

export function generateMockInmates(count: number): MockInmate[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomFrom(firstNames);
    const lastName = randomFrom(lastNames);
    const facility = randomFrom(FACILITIES);
    const block = randomFrom(CELL_BLOCKS);
    const enrollDate = randomDate(365);
    const statuses: MockInmate['status'][] = ['active', 'active', 'active', 'transferred', 'released', 'pending'];

    return {
      id: `inm-${String(i + 1).padStart(5, '0')}`,
      inmateId: `INM-${String(1000 + i).padStart(6, '0')}`,
      firstName,
      lastName,
      gender: Math.random() > 0.15 ? 'male' : 'female',
      dateOfBirth: format(subMonths(new Date(), Math.floor(Math.random() * 360) + 240), 'yyyy-MM-dd'),
      facility,
      cellBlock: `Block ${block}`,
      cellNumber: `${block}-${Math.floor(Math.random() * 40) + 1}`,
      enrollmentDate: enrollDate,
      status: randomFrom(statuses),
      lastUpdated: randomDate(30),
      admissionDate: randomDate(730),
      profilePhoto: '',
      notes: Math.random() > 0.7 ? 'Requires medical escort during transfers.' : '',
      auditTrail: [
        { date: enrollDate, action: 'Enrollment Created', user: 'Officer Rodriguez' },
        { date: randomDate(200), action: 'Face Images Updated', user: 'Officer Smith' },
        { date: randomDate(60), action: 'Status Reviewed', user: 'Supervisor Johnson' },
      ],
    };
  });
}

export type MockFaceSearchResult = {
  inmateId: string;
  firstName: string;
  lastName: string;
  facility: string;
  status: string;
  confidence: number;
  profilePhoto: string;
};

export function generateMockFaceResults(): MockFaceSearchResult[] {
  return [
    { inmateId: 'INM-001024', firstName: 'James', lastName: 'Wilson', facility: 'Central Correctional', status: 'active', confidence: 97.3, profilePhoto: '' },
    { inmateId: 'INM-001087', firstName: 'James', lastName: 'Williams', facility: 'Westfield Penitentiary', status: 'active', confidence: 84.1, profilePhoto: '' },
    { inmateId: 'INM-001152', firstName: 'Robert', lastName: 'Wilson', facility: 'Eastgate Detention Center', status: 'transferred', confidence: 71.6, profilePhoto: '' },
  ];
}

export const MOCK_INMATES = generateMockInmates(150);

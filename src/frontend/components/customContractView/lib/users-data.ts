// Mock users data with avatars
export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string; // For avatar background
}

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    avatar: 'AJ',
    color: 'monochrome', // Will use theme color
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    avatar: 'BS',
    color: 'monochrome',
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    avatar: 'CD',
    color: 'monochrome',
  },
  {
    id: 'user-4',
    name: 'David Wilson',
    avatar: 'DW',
    color: 'monochrome',
  },
  {
    id: 'user-5',
    name: 'Emma Brown',
    avatar: 'EB',
    color: 'monochrome',
  },
  {
    id: 'user-6',
    name: 'Frank Miller',
    avatar: 'FM',
    color: 'monochrome',
  },
];

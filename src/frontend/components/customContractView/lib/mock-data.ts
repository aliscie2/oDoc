// Mock data for prototype
import { Contract } from '../types/contract';
import { users } from './users-data';

export const mockContract: Contract = {
  id: 'contract-1',
  name: 'Website Development Agreement',
  creatorId: 'user-1',
  creatorName: 'Alice Johnson', // Contract creator for notification logic
  promises: [
    {
      id: 'promise-1',
      title: 'Initial Design Mockups',
      status: 'completed',
      sender: 'Alice Johnson',
      receiver: 'Bob Smith',
      amount: 500,
      conditions: [
        { id: 'cond-1', fieldName: 'Deliverable', value: 'Homepage mockup' },
        { id: 'cond-2', fieldName: 'Deliverable', value: 'Product page mockup' },
        { id: 'cond-3', fieldName: 'Due Date', value: '2025-10-15' },
        { id: 'cond-4', fieldName: 'Format', value: 'Figma files' },
      ],
      createdAt: new Date('2025-09-20'),
    },
    {
      id: 'promise-2',
      title: 'Frontend Development',
      status: 'confirmed',
      sender: 'Carol Davis',
      receiver: 'Bob Smith',
      amount: 800,
      conditions: [
        { id: 'cond-5', fieldName: 'Deliverable', value: 'React application' },
        { id: 'cond-6', fieldName: 'Technology', value: 'React + TypeScript' },
        { id: 'cond-7', fieldName: 'Due Date', value: '2025-11-30' },
      ],
      createdAt: new Date('2025-10-01'),
    },
    {
      id: 'promise-3',
      title: 'Payment Processing',
      status: 'objected',
      sender: 'Bob Smith',
      receiver: 'Alice Johnson',
      amount: 300,
      objectionText: 'The payment terms are not clear enough. Need more details on the timeline.',
      conditions: [
        { id: 'cond-8', fieldName: 'Payment Method', value: 'Wire transfer' },
        { id: 'cond-9', fieldName: 'Payment Terms', value: 'Net 30' },
      ],
      createdAt: new Date('2025-10-05'),
    },
    {
      id: 'promise-4',
      title: 'API Integration',
      status: 'active',
      sender: 'David Wilson',
      receiver: 'Alice Johnson',
      amount: 1200,
      conditions: [
        { id: 'cond-10', fieldName: 'Deliverable', value: 'REST API integration' },
        { id: 'cond-11', fieldName: 'Endpoints', value: '5 endpoints' },
        { id: 'cond-12', fieldName: 'Due Date', value: '2025-12-15' },
      ],
      createdAt: new Date('2025-10-10'),
    },
    {
      id: 'promise-5',
      title: 'Database Setup',
      status: 'confirmed',
      sender: 'Carol Davis',
      receiver: 'Alice Johnson',
      amount: 600,
      conditions: [
        { id: 'cond-13', fieldName: 'Deliverable', value: 'PostgreSQL database configuration' },
        { id: 'cond-14', fieldName: 'Features', value: 'User authentication tables' },
        { id: 'cond-15', fieldName: 'Due Date', value: '2025-11-20' },
      ],
      createdAt: new Date('2025-10-12'),
    },
  ],
};

export const currentUserId = 'user-1';
export const getCurrentUserName = () => {
  const user = users.find(u => u.id === currentUserId);
  return user ? user.name : 'Unknown User';
};

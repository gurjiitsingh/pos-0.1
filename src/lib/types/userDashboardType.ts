export type userDashboardType = {
  id: string;

  // Basic Info
  fullName: string;
  username: string;
  email: string;
  mobile: string;

  // Authentication
  hashedPassword: string;
  role: string;
  status: string;

  // Permissions
  isAdmin: boolean;
  isVerfied: boolean;

  // Employee Information
  employeeId?: string;
  department?: string;

  // Additional Information
  address?: string;
  notes?: string;

  // Future Payroll / HR Fields
  salary?: number;
  joiningDate?: string;
  shift?: string;
  attendanceEnabled?: boolean;
  leaveBalance?: number;
  reportingManager?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
};
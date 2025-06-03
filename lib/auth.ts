import { NextRequest } from 'next/server';

export function getAuthUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (!userId || !email || !role) {
    return null;
  }

  return {
    userId,
    email,
    role,
  };
}

export function requireAuth(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

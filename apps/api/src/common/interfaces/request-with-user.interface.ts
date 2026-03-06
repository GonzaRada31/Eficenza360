export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestWithUser {
  user: UserPayload;
}

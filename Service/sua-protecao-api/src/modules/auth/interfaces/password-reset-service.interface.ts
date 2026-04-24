export interface IPasswordResetService {
  initiateReset(email: string): Promise<{ message: string }>;
  completeReset(token: string, newPassword: string): Promise<{ message: string }>;
}

export const PASSWORD_RESET_SERVICE_TOKEN = 'PASSWORD_RESET_SERVICE';

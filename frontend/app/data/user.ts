// User account data

export interface UserAccount {
  balance: number;
  accountNumber: string;
  name: string;
  email: string;
}

export const userAccount: UserAccount = {
  balance: 125000.50,
  accountNumber: '1234567890',
  name: 'John Doe',
  email: 'demo@neobank.com',
};


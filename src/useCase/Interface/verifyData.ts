export  interface VerifyData {
    otp: string;
    userData: {
      name: string;
      email: string;
      phone: string;
      password: string;
    };
  }


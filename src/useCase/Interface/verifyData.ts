export  interface VerifyData {
    otp: string;
    role:string;
    roleData: {
      name: string;
      email: string;
      phone: string ;
      password: string ;
    };
  }


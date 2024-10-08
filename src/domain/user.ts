interface User {
  _id?: string;
  name: string;
  email: string;
  img?: string;
  phone: string;
  password: string;
  isBlocked?: boolean;
  isAdmin?: boolean;
  isGoogle?: boolean;
}

export default User;

export type Program = {
  id: number;
  name: string;
  email: string;
  picture: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  status: string;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};

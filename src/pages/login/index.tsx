import { AuthPage } from "@refinedev/antd";
import { adminAuth } from "../../providers";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        // Uzimamo Emial i Lozinku koje smo  napravili radi lakseg testiranja
        initialValues: adminAuth,
      }}
    />
  );
};

import { AuthBindings } from "@refinedev/core";

import { API_URL, dataProvider } from "./data";

// Za testiranje Autentikacije, koristimo ovaj email i sifru
export const adminAuth = {
  email: "michael.scott@dundermifflin.com",
  password: "demodemo",
};

export const authProvider: AuthBindings = {
  login: async ({ email }) => {
    try {
      // dataProvider.custom koristimo za custom request ka REFINE API-u
      // BUG
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email },
          // Salje email da proveri da li takav korisnik postoji
          // Ako postoji, vraca accessToken
          rawQuery: `
            mutation Login($email: String!) {
              login(loginInput: { email: $email }) {
                accessToken
              }
            }
          `,
        },
      });

      // Cuvamo taj accessToken
      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        // "/" je Home
        redirectTo: "/",
      };
    } catch (e) {
      const error = e as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "Login Failed!",
          name: "name" in error ? error.name : "Invalid email or password!",
        },
      };
    }
  },

  // Za Logout, samo izbacimo access token
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
        ...error,
      };
    }

    return { error };
  },

  check: async () => {
    try {
      // Uzimamo i proveravamo indentitet korisnika
      // kako bi znali da li je izvrsio autentikaciju ili ne
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
            query Me {
              me {
                name
              }
            }
          `,
        },
      });

      // Ako jeste autentikovan
      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (error) {
      // Ako nije autentikovan, vrati ga na login
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  // Uzimamo podatke o korisniku
  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");

    try {

      const { data } = await dataProvider.custom<{ me: any }>({
        url: API_URL,
        method: "post",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        meta: {
          // Uzimamo podatke od korisnika
          rawQuery: `
            query Me {
              me {
                id
                name
                email
                phone
                jobTitle
                timezone
                avatarUrl
              }
            }
          `,
        },
      });

      return data.me;
    } catch (error) {
      return undefined;
    }
  },
};
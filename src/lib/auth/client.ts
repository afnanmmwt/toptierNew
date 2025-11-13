"use client";

import type { User } from "@src/@types/user";
import { getUser as userData, signOut } from "@src/actions";

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signInWithPassword(
    params: SignInWithPasswordParams
  ): Promise<{ error?: string }> {


    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: "Password reset not implemented" };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: "Update reset not implemented" };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const response: any = await userData();
    if (response?.error) {
      return { error: response.error };
    }

    return { data: response };
  }

  async signOut(): Promise<{ error?: string }> {
    sessionStorage.removeItem('lastRoute');
    await signOut();


    return {};
  }
}

export const authClient = new AuthClient();

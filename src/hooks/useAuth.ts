import { useAuth0 } from "@auth0/auth0-react";

export function useAuth() {
  const { user, isLoading, loginWithRedirect, logout } = useAuth0();

  const signInWithGoogle = async () => {
    await loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  };

  const signOut = async () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return {
    user: user ?? null,
    loading: isLoading,
    signInWithGoogle,
    signOut,
  };
}

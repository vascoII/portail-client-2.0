
import { useEffect, useState } from "react";
import { isAuthSessionExpired } from "@/lib/auth/authSession";

export function useFkUser(): string | null {
  const [fkUser, setFkUser] = useState<string | null>(null);

  useEffect(() => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        const creationDate = authData?.state?.creationDate;
        if (isAuthSessionExpired(creationDate)) {
          localStorage.removeItem("auth-storage");
          setFkUser(null);
          return;
        }
        const user = authData?.state?.user;

        if (user?.FK) {
          const val = String(user.FK);
          setFkUser(val || null);
        }
      }
    } catch {
      setFkUser(null);
    }
  }, []);
  return fkUser;
}


import { useEffect, useState } from "react";

export function useFkUser(): string | null {
  const [fkUser, setFkUser] = useState<string | null>(null);

  useEffect(() => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const authData = JSON.parse(authStorage);
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

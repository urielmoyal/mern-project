import { useState, useCallback, useEffect } from "react";

const ONE_HOUR_IN_MILISECONDS = 1000 * 60 * 60;
let timmerId;

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState();
  const [userId, setUserId] = useState(false);

  const login = useCallback((uid, token, tokenExpiration) => {
    setToken(token);
    setUserId(uid);
    const expDate = tokenExpiration || new Date(new Date().getTime() + ONE_HOUR_IN_MILISECONDS * 2);
    setTokenExpiration(expDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({ userId: uid, token: token, tokenExpiration: expDate.toISOString() })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpiration(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpiration) {
      let timeout = tokenExpiration.getTime() - new Date().getTime();
      timmerId = setTimeout(logout, timeout);
    } else {
      clearTimeout(timmerId);
    }
  }, [token, logout, tokenExpiration]);

  useEffect(() => {
    const storageDate = JSON.parse(localStorage.getItem("userData"));

    //checks if token expiration pass
    if (storageDate && new Date(storageDate.tokenExpiration) > new Date()) {
      login(storageDate.userId, storageDate.token, new Date(storageDate.tokenExpiration));
    }
  }, [login]);

  return { userId, logout, login, token };
};
export default useAuth;

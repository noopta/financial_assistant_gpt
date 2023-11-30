import React, { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  const login = (userCredentials) => {
    // Implement login logic
    setAuthUser({
      name: userCredentials.username,
      email: userCredentials.email,
      company: userCredentials.company
    });
  };

  const logout = () => {
    // Implement logout logic
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ authUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
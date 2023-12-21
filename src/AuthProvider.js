import React, { useState, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  const login = (userCredentials) => {

    console.log("credentials")
    console.log(userCredentials)
    // Implement login logic
    setAuthUser({
      name: userCredentials.username,
      email: userCredentials.email,
      company: userCredentials.company,
      firstName: userCredentials.firstName,
      lastName: userCredentials.lastName,
      assistant_name: userCredentials.assistant_name,
      assistant_id: userCredentials.assistant_id,
      bucket: userCredentials.bucket_name,
      country: userCredentials.country,
      city: userCredentials.city,
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
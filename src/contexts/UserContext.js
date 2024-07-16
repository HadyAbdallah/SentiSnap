import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userInfo) => {
    setUser(userInfo);
    };

    const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    };

    return (
    <UserContext.Provider value={{ user, login, logout }}>
        {children}
    </UserContext.Provider>
);
};

export const useUser = () => {
    return useContext(UserContext);
};

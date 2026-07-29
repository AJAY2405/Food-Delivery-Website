// import { createContext, useContext, useState, useEffect } from "react";

// export const UserContext = createContext(null);

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(() => {
//         const savedUser = localStorage.getItem("user");
//         return savedUser ? JSON.parse(savedUser) : null;
//     });

//     useEffect(() => {
//         const savedUser = localStorage.getItem("user");
//         if (savedUser) {
//             setUser(JSON.parse(savedUser));
//         }
//     }, []);

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// export const getData = () => useContext(UserContext);



import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // Fast first paint from cache — fine for UI, not trusted for auth decisions
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setUser(null);
            return;
        }

        // Ask the server who this token actually belongs to.
        // The server decodes the signed JWT — it can't be spoofed by editing localStorage.
        axios
            .get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
            })
            .catch(() => {
                localStorage.clear();
                setUser(null);
            });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const getData = () => useContext(UserContext);
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeGroup, setActiveGroup] = useState(null);

    // Al cargar la página, comprobamos si ya hay token guardado
    useEffect(() => {
        const savedGroupId = localStorage.getItem('active_group_id');
        const savedGroupName = localStorage.getItem('active_group_name');
        if (savedGroupId && savedGroupName) {
            setActiveGroup({ id: savedGroupId, name: savedGroupName });
        }

        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                // Si el token ha caducado, cerramos sesión
                if (decoded.exp < currentTime) {
                    logout();
                    return;
                }
                // Podríamos validar si ha expirado aquí
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                localStorage.removeItem('access_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('token/', { username, password });

        // Guardamos los tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Decodificamos para tener datos del usuario
        const decoded = jwtDecode(response.data.access);
        setUser({ username: username }); // O lo que venga en el token
        return true;
    };

    const register = async (userData) => {
        await api.post('register/', userData);
        // Después de registrarse, hacemos login automático
        return login(userData.username, userData.password);
    };

    const selectGroup = (group) => {
        setActiveGroup(group);
        localStorage.setItem('active_group_id', group.id);
        localStorage.setItem('active_group_name', group.name);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);

        setActiveGroup(null);
        localStorage.removeItem('active_group_id');
        localStorage.removeItem('active_group_name');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, activeGroup, selectGroup }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
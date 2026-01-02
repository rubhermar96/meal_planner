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
        const savedGroup = localStorage.getItem('active_group');
        if (savedGroup) {
            try {
                setActiveGroup(JSON.parse(savedGroup));
            } catch (e) {
                console.error("Error parsing saved group:", e);
                localStorage.removeItem('active_group');
            }
        }

        // Limpiar claves antiguas por si existen (migración silenciosa)
        localStorage.removeItem('active_group_id');
        localStorage.removeItem('active_group_name');

        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                // Si el token ha caducado, cerramos sesión
                if (decoded.exp < currentTime) {
                    logout();
                    return;
                }

                // Si tenemos datos de usuario guardados, los restauramos
                if (userData) {
                    setUser(JSON.parse(userData));
                } else if (decoded.user_id) {
                    // Fallback básico si no hay user_data pero si token válido
                    // Podríamos intentar recuperar el nombre del token si viniera, 
                    // pero como vimos, suele venir solo user_id.
                    // Dejamos el usuario como "autenticado" al menos.
                    // Opcional: setUser({ id: decoded.user_id });
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error("Error restoring session:", error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('token/', { username, password });

        // Guardamos los tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Guardamos datos del usuario para persistencia
        const userData = { username };
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Decodificamos para tener datos del usuario
        // const decoded = jwtDecode(response.data.access); // No strictly needed just for username if we have it from input
        setUser(userData);

        // RESTORE USER PREFERENCE: Active Group
        const savedPreference = localStorage.getItem(`preference_active_group_${username}`);
        if (savedPreference) {
            try {
                const group = JSON.parse(savedPreference);
                setActiveGroup(group);
                // Sync session storage
                localStorage.setItem('active_group', savedPreference);
            } catch (e) {
                console.error("Error restoring group preference:", e);
            }
        }

        return true;
    };

    const register = async (userData) => {
        await api.post('register/', userData);
        // Después de registrarse, hacemos login automático
        return login(userData.username, userData.password);
    };

    const selectGroup = (group) => {
        setActiveGroup(group);
        localStorage.setItem('active_group', JSON.stringify(group));

        // SAVE USER PREFERENCE
        if (user && user.username) {
            localStorage.setItem(`preference_active_group_${user.username}`, JSON.stringify(group));
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);

        setActiveGroup(null);
        localStorage.removeItem('active_group');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, activeGroup, selectGroup }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
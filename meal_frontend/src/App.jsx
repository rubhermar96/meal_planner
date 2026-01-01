import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { RecipesPage } from "./pages/RecipesPage";
import { PlannerPage } from "./pages/PlannerPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GroupsPage } from "./pages/GroupsPage";
import { EditRecipePage } from "./pages/EditRecipePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";

// Componente para proteger rutas
const PrivateRoute = () => {
  const { user } = useAuth();
  // Si no hay usuario, mandamos al login
  return user ? <Outlet /> : <Navigate to="/login" />;
};
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Rutas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<PlannerPage />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="recipes/new" element={<CreateRecipePage />} />
              <Route path="/recipes/edit/:id" element={<EditRecipePage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="shopping-list" element={<ShoppingListPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="groups" element={<GroupsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
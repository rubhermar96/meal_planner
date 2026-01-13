import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
// Importamos el Layout nuevo que acabamos de modificar
import { Layout } from "./components/Layout";

// Features Pages
import { RecipesPage } from "./features/recipes/pages/RecipesPage";
import { PlannerPage } from "./features/planner/pages/PlannerPage";
import { CreateRecipePage } from "./features/recipes/pages/CreateRecipePage";
import { ShoppingListPage } from "./features/shopping_list/pages/ShoppingListPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { ProfilePage } from "./features/social/pages/ProfilePage";
import { GroupsPage } from "./features/social/pages/GroupsPage";
import { EditRecipePage } from "./features/recipes/pages/EditRecipePage";
import { RecipeDetailPage } from "./features/recipes/pages/RecipeDetailPage";

const PrivateRoute = () => {
  const { user } = useAuth();
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
            {/* El Layout ahora es el Sidebar + Header Móvil */}
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

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
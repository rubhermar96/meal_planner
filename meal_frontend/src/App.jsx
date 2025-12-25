import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RecipesPage } from "./pages/RecipesPage";
import { PlannerPage } from "./pages/PlannerPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { ShoppingListPage } from "./pages/ShoppingListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas estas rutas usarán el Layout (Menú superior) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<PlannerPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/new" element={<CreateRecipePage />} />
          <Route path="shopping-list" element={<ShoppingListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
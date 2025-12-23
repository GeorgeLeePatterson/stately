import {
  EntitiesIndexPage,
  EntityDetailsPage,
  EntityEditPage,
  EntityNewPage,
  EntityTypeListPage,
} from '@statelyjs/stately/core/pages';
import { Layout } from '@statelyjs/ui/layout';
import { Gem } from 'lucide-react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';

const useRequiredParams = <T extends Record<string, unknown>>() => useParams() as T;

function App() {
  return (
    <Layout.Root
      sidebarProps={{ collapsible: 'icon', logo: <Gem />, logoName: 'Tasks', variant: 'floating' }}
    >
      <Routes>
        {/* Dashboard */}
        <Route element={<Dashboard />} index path="/" />

        {/* Entity routes */}
        <Route element={<Entities />} path="/entities/*" />

        {/* Fallback */}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Layout.Root>
  );
}

// Entrypoint into entity configurations
function Entities() {
  return (
    <Routes>
      <Route element={<EntitiesIndexPage />} index path="/" />
      <Route element={<EntityType />} path="/:type/*" />
    </Routes>
  );
}

// Entrypoint into an entity type
function EntityType() {
  const { type } = useRequiredParams<{ type: string }>();
  return (
    <Routes>
      <Route element={<EntityTypeListPage entity={type} />} index path="/" />
      <Route element={<EntityNewPage entity={type} />} path="/new" />
      <Route element={<Entity entity={type} />} path="/:id/*" />
    </Routes>
  );
}

// Entrypoint into an instance of an entity
function Entity({ entity }: React.ComponentProps<typeof EntityNewPage>) {
  const { id } = useRequiredParams<{ id: string }>();
  return (
    <Routes>
      <Route element={<EntityDetailsPage entity={entity} id={id} />} index path="/" />
      <Route element={<EntityEditPage entity={entity} id={id} />} path="/edit" />
    </Routes>
  );
}
export default App;

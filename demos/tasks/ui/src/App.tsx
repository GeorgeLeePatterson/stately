import * as EntitiesPages from '@statelyjs/stately/core/pages';
import { Layout } from '@statelyjs/stately/layout';
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
      <Route element={<EntitiesPages.EntitiesIndexPage />} index path="/" />
      <Route element={<EntityType />} path="/:type/*" />
    </Routes>
  );
}

// Entrypoint into an entity type
function EntityType() {
  const { type } = useRequiredParams<{ type: string }>();
  return (
    <Routes>
      <Route element={<EntitiesPages.EntityTypeListPage entity={type} />} index path="/" />
      <Route element={<EntitiesPages.EntityNewPage entity={type} />} path="/new" />
      <Route element={<Entity entity={type} />} path="/:id/*" />
    </Routes>
  );
}

// Entrypoint into an instance of an entity
function Entity({ entity }: React.ComponentProps<typeof EntitiesPages.EntityNewPage>) {
  const { id } = useRequiredParams<{ id: string }>();
  return (
    <Routes>
      <Route element={<EntitiesPages.EntityDetailsPage entity={entity} id={id} />} index path="/" />
      <Route element={<EntitiesPages.EntityEditPage entity={entity} id={id} />} path="/edit" />
    </Routes>
  );
}

export default App;

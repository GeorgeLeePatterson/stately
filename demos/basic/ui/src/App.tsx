import * as EntityPages from '@statelyjs/stately/core/pages';
import { Layout } from '@statelyjs/ui/layout';
import { Gem } from 'lucide-react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

const useRequiredParams = <T extends Record<string, unknown>>() => useParams() as T;

function App() {
  return (
    <Layout.Root
      sidebarProps={{ collapsible: 'icon', logo: <Gem />, logoName: 'Basic', variant: 'floating' }}
    >
      <Routes>
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
      <Route element={<EntityPages.EntitiesIndexPage />} index path="/" />
      <Route element={<EntityType />} path="/:type/*" />
    </Routes>
  );
}

// Entrypoint into an entity type
function EntityType() {
  const { type } = useRequiredParams<{ type: string }>();
  return (
    <Routes>
      <Route element={<EntityPages.EntityTypeListPage entity={type} />} index path="/" />
      <Route element={<EntityPages.EntityNewPage entity={type} />} path="/new" />
      <Route element={<Entity entity={type} />} path="/:id/*" />
    </Routes>
  );
}

// Entrypoint into an instance of an entity
function Entity({ entity }: React.ComponentProps<typeof EntityPages.EntityNewPage>) {
  const { id } = useRequiredParams<{ id: string }>();
  return (
    <Routes>
      <Route element={<EntityPages.EntityDetailsPage entity={entity} id={id} />} index path="/" />
      <Route element={<EntityPages.EntityEditPage entity={entity} id={id} />} path="/edit" />
    </Routes>
  );
}
export default App;

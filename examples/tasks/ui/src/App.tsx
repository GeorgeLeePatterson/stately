import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from '@statelyjs/ui/layout';
import {
  EntitiesIndexPage,
  EntityTypeListPage,
  EntityDetailsPage,
  EntityEditPage,
  EntityNewPage,
} from '@statelyjs/stately/core/pages';
import { Gem } from 'lucide-react';

const useRequiredParams = <T extends Record<string, unknown>>() => useParams() as T;

function App() {
  return (
    <Layout.Root
      sidebarProps={{ collapsible: 'icon', logo: <Gem />, logoName: 'Tasks', variant: 'floating' }}
    >
      <Routes>
        {/* Dashboard */}
        <Route index path="/" element={<Dashboard />} />

        {/* Entity routes */}
        <Route path="/entities/*" element={<Entities />} />
        {/*
        <Route path="/entities" element={<EntitiesIndexPage />} />
        <Route path="/entities/:type" element={<EntityTypeList />} />
        <Route path="/entities/:type/new" element={<EntityNew />} />
        <Route path="/entities/:type/:id" element={<EntityDetails />} />
        <Route path="/entities/:type/:id/edit" element={<EntityEdit />} />
        */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout.Root>
  );
}

// Simple dashboard component
function Dashboard() {
  return (
    <Layout.Page title="Dashboard" description="Welcome to your task manager">
      <div className="grid gap-4">
        <p>Navigate to <a href="/entities/task" className="text-primary underline">Tasks</a> to get started.</p>
      </div>
    </Layout.Page>
  );
}

function Entities() {
  return (
    <Routes>
      <Route path="/" index element={<EntitiesIndexPage />} />
      <Route path="/:type/*" element={<EntityType />} />
    </Routes>
  );
}

function EntityType() {
  const { type } = useRequiredParams<{ type: string }>();
  return (
    <Routes>
      <Route path="/" index element={<EntityTypeListPage entity={type} />} />
      <Route path="/new" index element={<EntityNewPage entity={type} />} />
      <Route path="/:id/*" element={<Entity entity={type} />} />
    </Routes>
  );
}

function Entity({ entity }: React.ComponentProps<typeof EntityNewPage>) {
  const { id } = useRequiredParams<{ id: string }>();
  return (
    <Routes>
      <Route path="/" index element={<EntityDetailsPage entity={entity} id={id} />} />
      <Route path="/edit" element={<EntityEditPage entity={entity} id={id} />} />
    </Routes>
  );
}

// Route wrapper components to extract params
// function EntityTypeList() {
//   const { type } = useParams();
//   return <EntityTypeListPage entity={type!} />;
// }

// function EntityNew() {
//   const { type } = useParams();
//   return <EntityNewPage entity={type!} />;
// }

// function EntityDetails() {
//   const { type, id } = useParams();
//   return <EntityDetailsPage entity={type!} id={id!} />;
// }

// function EntityEdit() {
//   const { type, id } = useParams();
//   return <EntityEditPage entity={type!} id={id!} />;
// }

export default App;

// import type { Schemas } from '@stately/schema';
// import { createFileRoute, Link } from '@tanstack/react-router';
// import { PageView } from '@/components/layout/page';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useStatelyUi } from '@/index';
// import { type StateEntry, xeo4Schema } from '@/lib/stately-integration';

// export const Route = createFileRoute('/entities/')({ component: EntitiesIndex });

// // TODO: Use `generateEntityTypeDisplay`
// // Generate entity types from metadata

// function EntitiesIndex<Schema extends Schemas = Schemas>() {
//   const { schema, plugins } = useStatelyUi<Schema, []>();

//   const entityTypes = plugins.core.utils?.generateEntityTypeDisplay(schema.data);

//   return (
//     <PageView
//       breadcrumbs={[{ label: 'Configurations' }]}
//       description="Browse configuration types used by the application"
//       title="Configurations"
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {entityTypes
//           .sort((a, b) => a.label.localeCompare(b.label))
//           .map(({ type, label, description }) => (
//             <Link key={type} params={{ type }} to="/entities/$type">
//               <Card className="h-full hover:border-primary transition-colors cursor-pointer">
//                 <CardHeader>
//                   <CardTitle>{label}</CardTitle>
//                   {description && (
//                     <CardDescription className="text-xs">{description}</CardDescription>
//                   )}
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-xs text-muted-foreground italic">View all</p>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//       </div>
//     </PageView>
//   );
// }

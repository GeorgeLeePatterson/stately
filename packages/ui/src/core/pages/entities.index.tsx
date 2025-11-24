import type { Schemas } from '@stately/schema';
import { Page } from '@/base/layout/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/base/ui/card';
import { useStatelyUi } from '@/index';

// TODO: Move to stately/tanstack
// export const Route = createFileRoute('/entities/')({ component: EntitiesIndex });

export function EntitiesIndex<Schema extends Schemas = Schemas>() {
  const { schema, plugins } = useStatelyUi<Schema>();

  const entityTypes = plugins.core.utils?.generateEntityTypeDisplay(schema.data) || [];

  return (
    <Page
      breadcrumbs={[{ label: 'Configurations' }]}
      description="Browse configuration types used by the application"
      title="Configurations"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entityTypes
          .sort((a, b) => a.label.localeCompare(b.label))
          .map(({ type, label, description }) => (
            <a href={`/entities/${type}`} key={type}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                  {description && (
                    <CardDescription className="text-xs">{description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground italic">View all</p>
                </CardContent>
              </Card>
            </a>
          ))}
      </div>
    </Page>
  );
}

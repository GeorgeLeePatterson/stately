import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@statelyjs/ui/components/base/card';
import { Layout, type PageProps } from '@statelyjs/ui/layout';
import type { Schemas } from '@/core/schema';
import { useStatelyUi } from '@/index';
import { useEntityUrl } from '../hooks';

export function EntitiesIndexPage<Schema extends Schemas = Schemas>(props: Partial<PageProps>) {
  const { plugins } = useStatelyUi<Schema>();

  const resolveEntityUrl = useEntityUrl();
  const resolveUrl = (urlPath: string) => resolveEntityUrl({ type: urlPath });

  const breadcrumbs = props?.breadcrumbs ?? [{ label: 'Configurations' }];
  const description = props?.description ?? 'Browse configuration types used by the application';
  const title = props?.title ?? 'Configurations';

  return (
    <Layout.Page breadcrumbs={breadcrumbs} description={description} title={title}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(plugins.core.utils?.generateEntityTypeDisplay() || [])
          .sort((a, b) => a.label.localeCompare(b.label))
          .map(({ urlPath, label, description }) => (
            <a href={resolveUrl(urlPath)} key={urlPath}>
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
    </Layout.Page>
  );
}

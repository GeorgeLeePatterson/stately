import { Note } from '@statelyjs/ui/components';
import { Card, CardContent, CardHeader, CardTitle } from '@statelyjs/ui/components/base/card';
import { Spinner } from '@statelyjs/ui/components/base/spinner';
import { Layout } from '@statelyjs/ui/layout';
import { useQuery } from '@tanstack/react-query';
import { client } from './lib/stately';

// Simple dashboard component
export function Dashboard() {
  // Pull metrics from the api. The backend can be used like any api.
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const { data, error } = await client.GET('/metrics');
      if (error) throw new Error('Failed to fetch metrics');
      return data;
    },
    queryKey: ['metrics'],
    refetchInterval: 5000,
  });

  return (
    <Layout.Page description="Welcome to your task manager" title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Quick Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Navigate to{' '}
              <a className="text-primary underline" href="/entities/task">
                Tasks
              </a>{' '}
              to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Task Metrics
              {isLoading ? (
                <span className="ml-2">
                  <Spinner className="w-4 h-4" />{' '}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <Note message={`Request failed: ${error.message}`} />}
            {data ? (
              <div>
                <p>Total Actions: {data.tasks_created + data.tasks_removed}</p>
                <p>Created Tasks: {data.tasks_created}</p>
                <p>Deleted Tasks: {data.tasks_removed}</p>
              </div>
            ) : (
              <span>No metrics available</span>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout.Page>
  );
}

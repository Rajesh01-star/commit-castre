import { useQuery } from '@tanstack/react-query';
import { Commit, FetchCommitsParams, GitHubEvent, Repository } from '../types/github';

const formatDateForApi = (date: string) => {
  return new Date(date).toISOString();
};

async function fetchGithubCommits({
  githubToken,
  username,
  startDate,
  endDate,
}: FetchCommitsParams): Promise<Commit[]> {
  const formattedStartDate = formatDateForApi(startDate);
  const formattedEndDate = formatDateForApi(endDate);

  // First get the user's events to find repositories they've committed to
  const eventsResponse = await fetch(
    `https://api.github.com/users/${username}/events?per_page=100`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!eventsResponse.ok) {
    const errorData = await eventsResponse.json();
    throw new Error(errorData.message || 'Failed to fetch user events');
  }

  const events: GitHubEvent[] = await eventsResponse.json();
  
  // Get unique repositories from push events
  const repositories: Repository[] = events
    .filter((event: GitHubEvent) => event.type === 'PushEvent')
    .map((event: GitHubEvent) => ({
      owner: event.repo.name.split('/')[0],
      repo: event.repo.name.split('/')[1]
    }))
    .filter((repo: Repository, index: number, self: Repository[]) => 
      index === self.findIndex((r: Repository) => r.owner === repo.owner && r.repo === repo.repo)
    );

  // Fetch commits from each repository
  const allCommits = [];
  for (const repo of repositories) {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?author=${username}&since=${formattedStartDate}&until=${formattedEndDate}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.ok) {
      const repoCommits: Commit[] = await response.json();
      allCommits.push(...repoCommits.map((commit: Commit) => ({
        ...commit,
        repository: `${repo.owner}/${repo.repo}`
      })));
    }
  }

  // Sort commits by date
  return allCommits.sort((a, b) => 
    new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  );
}

export function useGithubCommits(params: FetchCommitsParams | null) {
  return useQuery({
    queryKey: ['commits', params],
    queryFn: () => {
      if (params && params.githubToken) {
        return fetchGithubCommits(params);
      }
      return Promise.resolve([]);
    },
    enabled: !!params && !!params.githubToken,
  });
}

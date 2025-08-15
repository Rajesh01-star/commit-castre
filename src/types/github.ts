export interface GitHubEvent {
  type: string;
  repo: {
    name: string;
  };
}

export interface Repository {
  owner: string;
  repo: string;
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  repository?: string;
}

export interface GithubFormData {
  githubToken: string;
  username: string;
  startDate: string;
  endDate: string;
}

export interface FetchCommitsParams {
  githubToken: string;
  username: string;
  startDate: string;
  endDate: string;
}

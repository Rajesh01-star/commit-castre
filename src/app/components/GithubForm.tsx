'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { GithubFormData } from '@/types/github';
import { useGithubCommits } from '@/hooks/useGithubCommits';
import CommitList from './CommitList';

const schema = yup.object().shape({
  githubToken: yup.string().required('GitHub token is required'),
  username: yup.string()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, 'Must be a valid GitHub username'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required')
});

export default function GithubForm() {
  const [queryParams, setQueryParams] = useState<GithubFormData | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GithubFormData>({
    resolver: yupResolver(schema),
  });

  const { data: commits = [], isLoading, error } = useGithubCommits(queryParams);

  const onSubmit = (data: GithubFormData) => {
    setQueryParams(data);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start p-4 gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-5 bg-zinc-900/50 p-6 rounded-2xl backdrop-blur-sm border border-zinc-800/50">
        <h1 className="text-sm font-medium text-zinc-400 mb-6">GitHub Commit Data</h1>
        
        <div className="space-y-3">
          <div>
            <input
              type="password"
              {...register('githubToken')}
              className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              placeholder="GitHub Access Token"
            />
            {errors.githubToken && (
              <p className="mt-1.5 text-xs text-rose-500/90">{errors.githubToken.message}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              {...register('username')}
              className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              placeholder="e.g., Rajesh01-star"
            />
            <p className="mt-1 text-xs text-zinc-500">Your GitHub username (not email) whose commits you want to fetch</p>
            {errors.username && (
              <p className="mt-1.5 text-xs text-rose-500/90">{errors.username.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                {...register('startDate')}
                className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
              />
              {errors.startDate && (
                <p className="mt-1.5 text-xs text-rose-500/90">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <input
                type="date"
                {...register('endDate')}
                className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
              />
              {errors.endDate && (
                <p className="mt-1.5 text-xs text-rose-500/90">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 mt-6 rounded-xl text-xs font-medium text-white bg-blue-600/80 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
        >
          Fetch Commit Data
        </button>
      </form>

      <CommitList 
        commits={commits} 
        isLoading={isLoading} 
        error={error as Error | null}
        timeRange={queryParams ? {
          startDate: queryParams.startDate,
          endDate: queryParams.endDate
        } : undefined}
      />
    </div>
  );
}
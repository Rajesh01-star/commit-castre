"use client";

import { useState } from "react";
import { Commit } from "@/types/github";

interface CommitListProps {
  commits: Commit[];
  isLoading: boolean;
  error: Error | null;
  timeRange?: {
    startDate: string;
    endDate: string;
  };
  onGenerateEmail: () => void;
}

export default function CommitList({
  commits,
  isLoading,
  error,
  timeRange,
  onGenerateEmail,
}: CommitListProps) {
  const [visibleCommits, setVisibleCommits] = useState(5);

  const handleShowMore = () => {
    setVisibleCommits((prev) => prev + 5);
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <div className="text-sm text-zinc-400">Loading commits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
        <div className="text-sm text-rose-500/90">{error.message}</div>
      </div>
    );
  }

  if (!commits.length) {
    return null;
  }

  const displayedCommits = commits.slice(0, visibleCommits);
  const hasMoreCommits = commits.length > visibleCommits;

  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-zinc-400">
            Found {commits.length} commit{commits.length === 1 ? "" : "s"}
          </div>
          {commits.length > 0 && timeRange && (
            <button
              onClick={onGenerateEmail}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600/80 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            >
              Generate Email Summary
            </button>
          )}
        </div>

        <div className="space-y-3">
          {displayedCommits.map((commit) => (
            <a
              key={commit.sha}
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-zinc-300 truncate">
                    {commit.commit.message.split("\n")[0]}
                  </div>
                  <div className="text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(commit.commit.author.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{commit.commit.author.name}</span>
                  <span>·</span>
                  <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                  <span>·</span>
                  <span className="text-blue-400/70">{commit.repository}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {hasMoreCommits && (
          <button
            onClick={handleShowMore}
            className="w-full py-2 text-xs font-medium text-zinc-400 bg-zinc-900/50 rounded-xl hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 transition-colors"
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Commit } from "@/types/github";

interface CommitListProps {
  commits: Commit[];
  isLoading: boolean;
  error: Error | null;
  timeRange?: {
    startDate: string;
    endDate: string;
  };
  onGenerateEmail: (selectedCommits: Commit[]) => void;
  tone?: string;
  setTone?: (tone: string) => void;
}

export default function CommitList({
  commits,
  isLoading,
  error,
  timeRange,
  onGenerateEmail,
  tone,
  setTone,
}: CommitListProps) {
  const [visibleCommits, setVisibleCommits] = useState(5);
  const [selectedCommitShas, setSelectedCommitShas] = useState<Set<string>>(new Set());

  // Initialize selected commits when commits change
  // If no commits are selected yet (first load), select all
  // But since commits can change, we need to be careful.
  // A simple approach: When commits arrive, if selection is empty, select all.
  // Actually, useEffect is better.

  // Wait, let's keep it simple. If size is 0 and we haven't touched it, maybe all are selected implicitly?
  // Explicit is better.

  // Let's use an effect to select all by default when commits load.
  // Or just check if set is empty? No, because user might deselect all.

  const handleShowMore = () => {
    setVisibleCommits((prev) => prev + 5);
  };

  const toggleCommit = (sha: string) => {
    const newSelected = new Set(selectedCommitShas);
    if (newSelected.has(sha)) {
      newSelected.delete(sha);
    } else {
      newSelected.add(sha);
    }
    setSelectedCommitShas(newSelected);
  };

  const toggleAll = () => {
    if (selectedCommitShas.size === commits.length) {
      setSelectedCommitShas(new Set());
    } else {
      setSelectedCommitShas(new Set(commits.map(c => c.sha)));
    }
  };

  // Initialize selection when commits change
  useEffect(() => {
    if (commits.length > 0) {
      setSelectedCommitShas(new Set(commits.map((c) => c.sha)));
    }
  }, [commits]);

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
            <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto">
              {setTone && (
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900/50 rounded-xl border border-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="concise">Concise</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              )}
              <button
                onClick={() => {
                  const selected = commits.filter(c => selectedCommitShas.has(c.sha));
                  if (selected.length === 0 && selectedCommitShas.size === 0) {
                     // If nothing explicitly selected (and maybe initialized empty), use all?
                     // Or force user to select?
                     // Let's assume if size is 0 but commits exist, we send all IF we haven't initialized?
                     // No, better UI is to initialize with all selected.
                     // I'll fix the initialization below with useEffect.
                     // For now, assume selectedCommitShas is correct.
                     onGenerateEmail(commits.filter(c => selectedCommitShas.has(c.sha)));
                  } else {
                     onGenerateEmail(selected);
                  }
                }}
                disabled={selectedCommitShas.size === 0}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600/80 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Email Summary ({selectedCommitShas.size})
              </button>
            </div>
          )}
        </div>

        {commits.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              checked={selectedCommitShas.size === commits.length && commits.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-xs text-zinc-400">Select All</span>
          </div>
        )}

        <div className="space-y-3">
          {displayedCommits.map((commit) => (
            <div
               key={commit.sha}
               className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCommitShas.has(commit.sha)}
                onChange={() => toggleCommit(commit.sha)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-blue-600 focus:ring-blue-500/30"
              />
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
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
            </div>
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

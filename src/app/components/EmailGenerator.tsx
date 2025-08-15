'use client';

import { EmailContent } from '@/types/email';
import { useState } from 'react';

interface EmailGeneratorProps {
  email: EmailContent | null;
  isLoading: boolean;
  error?: string | null;
}

export default function EmailGenerator({ email, isLoading, error }: EmailGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (email) {
      const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-lg p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <div className="text-sm text-zinc-400">Generating email...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
        <div className="text-sm text-rose-500/90">{error}</div>
      </div>
    );
  }

  if (!email) {
    return null;
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">Generated Email</h2>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-xs font-medium text-zinc-300 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Email'}
        </button>
      </div>
      
      <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300">Subject</h3>
          <p className="text-sm text-zinc-400">{email.subject}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300">Body</h3>
          <div className="text-sm text-zinc-400 whitespace-pre-wrap">{email.body}</div>
        </div>
      </div>
    </div>
  );
}

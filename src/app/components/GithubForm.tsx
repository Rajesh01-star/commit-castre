"use client";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { GithubFormData } from "@/types/github";
import { useGithubCommits } from "@/hooks/useGithubCommits";
import CommitList from "./CommitList";
import EmailGenerator from "./EmailGenerator";
import { useGeminiEmail } from "@/hooks/useGeminiEmail";
import { useSession, signIn, signOut } from "next-auth/react";

const schema = yup.object().shape({
  githubToken: yup.string().when('$isAuth', {
      is: (val: boolean) => val === false || val === undefined,
      then: (schema) => schema.required("GitHub token is required"),
      otherwise: (schema) => schema.optional(),
  }),
  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
      "Must be a valid GitHub username"
    ),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
});

export default function GithubForm() {
  const { data: session } = useSession();
  const [queryParams, setQueryParams] = useState<GithubFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GithubFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    context: { isAuth: !!session },
  });

  useEffect(() => {
    // @ts-expect-error - username is added to session in auth.ts
    if (session?.user?.username) {
      // @ts-expect-error - username is added to session in auth.ts
      setValue("username", session.user.username as string);
    }
    // We don't set githubToken here because it's handled internally if session exists
  }, [session, setValue]);

  const {
    data: commits = [],
    isLoading,
    error,
  } = useGithubCommits(queryParams);
  const {
    mutate: generateEmail,
    data: emailData,
    isPending: isGenerating,
    error: emailError,
  } = useGeminiEmail();

  const [tone, setTone] = useState("professional");

  const onSubmit = (data: GithubFormData) => {
    const submitData = { ...data };
    if (session) {
      // @ts-expect-error - accessToken is added to session in auth.ts
      submitData.githubToken = session.accessToken as string;
    }
    setQueryParams(submitData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="">
        <div className="w-full mx-auto max-w-lg mb-6 flex justify-end">
           {session ? (
             <div className="flex items-center gap-3">
               <span className="text-sm text-zinc-400">Signed in as {session.user?.email || session.user?.name}</span>
               <button
                 onClick={() => signOut()}
                 className="text-xs text-red-400 hover:text-red-300 transition-colors"
               >
                 Sign out
               </button>
             </div>
           ) : (
             <button
               onClick={() => signIn("github")}
               className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#24292F] hover:bg-[#24292F]/90 rounded-xl transition-colors"
             >
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
               </svg>
               Sign in with GitHub
             </button>
           )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full mx-auto max-w-lg mb-6 space-y-5 bg-zinc-900/50 p-6 rounded-2xl backdrop-blur-sm border border-zinc-800/50"
        >
          <h1 className="text-sm font-medium text-zinc-400 mb-6">
            GitHub Commit Data
          </h1>

          <div className="space-y-3">
            {!session && (
            <div>
              <input
                type="password"
                {...register("githubToken")}
                className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                placeholder="GitHub Access Token"
              />
              {errors.githubToken && (
                <p className="mt-1.5 text-xs text-rose-500/90">
                  {errors.githubToken.message}
                </p>
              )}
            </div>
            )}

            <div>
              <input
                type="text"
                {...register("username")}
                className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                placeholder="e.g., Rajesh01-star"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Your GitHub username (not email) whose commits you want to fetch
              </p>
              {errors.username && (
                <p className="mt-1.5 text-xs text-rose-500/90">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  {...register("startDate")}
                  className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
                />
                {errors.startDate && (
                  <p className="mt-1.5 text-xs text-rose-500/90">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  {...register("endDate")}
                  className="mt-1 block w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-colors [color-scheme:dark]"
                />
                {errors.endDate && (
                  <p className="mt-1.5 text-xs text-rose-500/90">
                    {errors.endDate.message}
                  </p>
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

        <div className={`space-y-6 ${emailData ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          <CommitList
            commits={commits}
            isLoading={isLoading}
            error={error as Error | null}
            timeRange={
              queryParams
                ? {
                    startDate: queryParams.startDate,
                    endDate: queryParams.endDate,
                  }
                : undefined
            }
            onGenerateEmail={(selectedCommits) => {
              if (selectedCommits.length > 0 && queryParams) {
                generateEmail({
                  commits: selectedCommits,
                  timeRange: {
                    startDate: queryParams.startDate,
                    endDate: queryParams.endDate,
                  },
                  tone,
                });
              }
            }}
            tone={tone}
            setTone={setTone}
          />
          {(isGenerating || emailData || emailError) && (
            <EmailGenerator
              email={emailData?.email || null}
              isLoading={isGenerating}
              error={
                emailError instanceof Error
                  ? emailError.message
                  : emailData?.error
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

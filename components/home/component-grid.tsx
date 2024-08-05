"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Popover from "@/components/shared/popover";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

interface Repo {
  id: number;
  full_name: string;
  name: string;
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  committer: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  parents: {
    sha: string;
    url: string;
    html_url: string;
  }[];
  diff: string; // Include the diff field
}

export default function ComponentGrid() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [openRepoPopover, setOpenRepoPopover] = useState(false);
  const [openCommitPopover, setOpenCommitPopover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/repos")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch repos");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setRepos(data);
          } else {
            throw new Error("Invalid repos data format");
          }
        })
        .catch((err) => setError(err.message));
    }
  }, [status]);

  useEffect(() => {
    if (selectedRepo) {
      fetch(`/api/commits?repo=${selectedRepo}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch commits");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setCommits(data);
          } else {
            throw new Error("Invalid commits data format");
          }
        })
        .catch((err) => setError(err.message));
    }
  }, [selectedRepo]);

  const handleSummarize = async () => {
    if (!selectedCommit) return;

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diff: selectedCommit.diff }), // Send the diff for summarization
      });
      if (!response.ok) throw new Error("Failed to summarize commit");
      const result = await response.json();
      setSummary(result.summary || "No summary available");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Please log in</p>;
  }

  return (
    <>
      {error && <p>Error: {error}</p>}
      {status === "authenticated" && (
        <div className="relative flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center z-10">
            <Popover
              content={
                <div className="w-full min-w-[200px] max-w-max rounded-md bg-white p-2 shadow-lg z-20">
                  {repos.map((repo) => (
                    <button
                      key={repo.id}
                      className="flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
                      onClick={() => {
                        setSelectedRepo(repo.full_name);
                        setOpenRepoPopover(false);
                        setSelectedCommit(null); // Clear the selected commit when a new repo is selected
                        setCommits([]); // Clear commits when a new repo is selected
                        setSummary(""); // Clear summary when a new repo is selected
                      }}
                    >
                      {repo.full_name}
                    </button>
                  ))}
                </div>
              }
              openPopover={openRepoPopover}
              setOpenPopover={setOpenRepoPopover}
            >
              <button
                onClick={() => setOpenRepoPopover(!openRepoPopover)}
                className="flex items-center justify-between min-w-[200px] rounded-md border border-gray-300 px-4 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
              >
                <p className="text-gray-600">
                  {selectedRepo ? selectedRepo : "Select Repository"}
                </p>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-all ${
                    openRepoPopover ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Popover>

            <Popover
              content={
                <div className="w-full min-w-[200px] max-w-max rounded-md bg-white p-2 shadow-lg z-20">
                  {commits.map((commit) => (
                    <button
                      key={commit.sha}
                      className="flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
                      onClick={() => {
                        setSelectedCommit(commit);
                        setOpenCommitPopover(false);
                      }}
                    >
                      {commit.commit.message}
                    </button>
                  ))}
                </div>
              }
              openPopover={openCommitPopover}
              setOpenPopover={setOpenCommitPopover}
            >
              <button
                onClick={() => setOpenCommitPopover(!openCommitPopover)}
                className="flex items-center justify-between min-w-[200px] rounded-md border border-gray-300 px-4 py-2 transition-all duration-75 hover:border-gray-800 focus:outline-none active:bg-gray-100"
                disabled={!selectedRepo} // Disable if no repo is selected
              >
                <p className="text-gray-600">
                  {selectedCommit ? selectedCommit.commit.message : "Select Commit"}
                </p>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-all ${
                    openCommitPopover ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Popover>
          </div>

          <button
            className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-blue-500 bg-blue-500 px-6 py-3 text-base text-white transition-colors hover:bg-blue-600 hover:border-blue-600 z-10"
            onClick={handleSummarize}
          >
            <Image
              src="/AiStar.png" // Path to the uploaded icon image
              alt="Summarize Icon"
              width={32}
              height={32}
              className="text-white group-hover:text-white"
            />
            <p>Create Post</p>
          </button>

          {summary && (
            <div className="w-full flex flex-col items-center space-y-4 mt-4 z-10">
              <textarea
                value={summary}
                readOnly
                className="w-full max-w-4xl p-4 border rounded-md resize-none"
                rows={6}
                placeholder="Summary will appear here..."
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

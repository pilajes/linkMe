// /app/api/commits/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo');
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Fetch the list of commits
    const response = await fetch(`https://api.github.com/repos/${repo}/commits`, {
        headers: {
            Authorization: `Bearer process.env.GITHUB_ACCESS_TOKEN`, // Ensure you replace YOUR_GITHUB_TOKEN with a valid token
            Accept: 'application/vnd.github.v3+json'
        },
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch commits" }), { status: response.status });
    }

    const commits = await response.json();

    // Fetch details for each commit, including the patch
    const detailedCommits = await Promise.all(commits.map(async (commit: any) => {
        const commitResponse = await fetch(commit.url, {
            headers: {
                Authorization: `Bearer GITHUB_ACCESS_TOKEN`, // Ensure you replace YOUR_GITHUB_TOKEN with a valid token
                Accept: 'application/vnd.github.v3.diff' // This tells GitHub to return the diff/patch information
            },
        });
        console.log(commitResponse);

        if (!commitResponse.ok) {
            return null; // Handle errors as needed
        }

        const diff = await commitResponse.text(); // Get the diff as text
        console.log("diff");
        console.log(diff);
        return {
            ...commit,
            diff
        };
    }));

    return new Response(JSON.stringify(detailedCommits.filter(Boolean)), { status: 200 });
}

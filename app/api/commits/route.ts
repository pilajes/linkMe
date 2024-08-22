import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma"; // Adjust the import to match your project structure

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo');
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userName = session?.user?.name;

    if (!userName) {
        return new Response(JSON.stringify({ error: "User name not found in session" }), { status: 400 });
    }

    // Fetch the user ID from the User table using the name
    const user = await prisma.user.findFirst({
        where: { name: userName },
    });

    if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userId = user.id;

    // Fetch the access token from the Account table using the user ID
    const account = await prisma.account.findFirst({
        where: { userId: userId, provider: "github" }, // Adjust provider if necessary
    });

    if (!account || !account.access_token) {
        return new Response(JSON.stringify({ error: "Access token not found" }), { status: 404 });
    }

    const accessToken = account.access_token;

    // Fetch the list of commits
    const response = await fetch(`https://api.github.com/repos/${repo}/commits`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
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
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3.diff' // This tells GitHub to return the diff/patch information
            },
        });

        if (!commitResponse.ok) {
            return null; // Handle errors as needed
        }

        const diff = await commitResponse.text(); // Get the diff as text
        return {
            ...commit,
            diff
        };
    }));

    return new Response(JSON.stringify(detailedCommits.filter(Boolean)), { status: 200 });
}

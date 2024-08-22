import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import to match your project structure

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userName = session?.user?.name;

    if (!userName) {
        return NextResponse.json({ error: "User name not found in session" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: { name: userName },
    });    

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Fetch the access token from the Account table using the user ID
    const account = await prisma.account.findFirst({
        where: { userId: userId, provider: "github" }, // Adjust provider if necessary
    });

    if (!account || !account.access_token) {
        return NextResponse.json({ error: "Access token not found" }, { status: 404 });
    }

    const accessToken = account.access_token;

    // Use the access token to make the GitHub API request
    const response = await fetch(`https://api.github.com/user/repos`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status });
    }

    const repos = await response.json();
    return NextResponse.json(repos, { status: 200 });
}

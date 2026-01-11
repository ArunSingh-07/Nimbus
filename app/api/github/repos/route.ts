
import { NextResponse } from "next/server";
import { currentUser } from "@/modules/auth/actions";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        provider: "github",
      },
    });

    if (!account || !account.accessToken) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 404 });
    }

    const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: res.status });
    }

    const repos = await res.json();
    
    // Map to a simpler structure
    const simplifiedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      updated_at: repo.updated_at,
      stars: repo.stargazers_count,
    }));

    return NextResponse.json(simplifiedRepos);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

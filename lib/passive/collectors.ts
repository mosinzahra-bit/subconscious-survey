export interface CollectedSample {
  rawText: string;
  source: string;
  url?: string;
}

export async function collectFromReddit(
  searchTerms: string[],
  limit: number
): Promise<CollectedSample[]> {
  const samples: CollectedSample[] = [];
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    for (let i = 0; i < Math.min(limit, 50); i++) {
      samples.push({
        rawText: `[Reddit mock] Sample post about ${searchTerms[i % searchTerms.length]} — simulated for demo.`,
        source: "reddit",
        url: "https://reddit.com/r/demo"
      });
    }
    return samples;
  }
  try {
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    if (!token) return samples;
    const query = searchTerms.slice(0, 3).join(" OR ");
    const res = await fetch(
      `https://oauth.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 25)}&sort=relevance`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const json = await res.json();
    const list = json?.data?.children ?? [];
    for (const child of list) {
      const post = child?.data;
      if (post?.selftext) {
        samples.push({
          rawText: post.selftext.slice(0, 2000),
          source: "reddit",
          url: `https://reddit.com${post.permalink}`
        });
      }
    }
  } catch (_) {
    for (let i = 0; i < Math.min(limit, 30); i++) {
      samples.push({
        rawText: `[Reddit] Simulated post ${i + 1} about ${searchTerms[i % searchTerms.length]}.`,
        source: "reddit"
      });
    }
  }
  return samples;
}

export async function collectFromApify(
  _actorId: string,
  searchTerms: string[],
  limit: number
): Promise<CollectedSample[]> {
  const samples: CollectedSample[] = [];
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    for (let i = 0; i < Math.min(limit, 40); i++) {
      samples.push({
        rawText: `[Reviews mock] Simulated review ${i + 1} mentioning ${searchTerms[i % searchTerms.length]}.`,
        source: "reviews"
      });
    }
    return samples;
  }
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchStrings: searchTerms.slice(0, 2),
          maxCrawledPlacesPerSearch: Math.min(limit, 20)
        })
      }
    );
    if (!res.ok) throw new Error("Apify run failed");
    const run = await res.json();
    const runId = run?.data?.id;
    if (runId) {
      for (let i = 0; i < Math.min(limit, 25); i++) {
        samples.push({
          rawText: `[Apify review] Simulated review content for ${searchTerms[i % searchTerms.length]}.`,
          source: "reviews"
        });
      }
    }
  } catch (_) {
    for (let i = 0; i < Math.min(limit, 40); i++) {
      samples.push({
        rawText: `[Reviews] Simulated review ${i + 1}.`,
        source: "reviews"
      });
    }
  }
  return samples;
}

export async function collectFromTwitter(
  searchTerms: string[],
  limit: number
): Promise<CollectedSample[]> {
  const samples: CollectedSample[] = [];
  const bearer = process.env.TWITTER_BEARER_TOKEN;
  if (!bearer) {
    for (let i = 0; i < Math.min(limit, 30); i++) {
      samples.push({
        rawText: `[Twitter mock] Simulated tweet about ${searchTerms[i % searchTerms.length]}.`,
        source: "twitter"
      });
    }
    return samples;
  }
  try {
    const query = searchTerms.slice(0, 2).map((t) => `"${t}"`).join(" OR ");
    const res = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${Math.min(limit, 100)}`,
      {
        headers: { Authorization: `Bearer ${bearer}` }
      }
    );
    const json = await res.json();
    const tweets = json?.data ?? [];
    for (const t of tweets) {
      if (t.text) {
        samples.push({
          rawText: t.text,
          source: "twitter",
          url: `https://twitter.com/i/status/${t.id}`
        });
      }
    }
  } catch (_) {
    for (let i = 0; i < Math.min(limit, 30); i++) {
      samples.push({
        rawText: `[Twitter] Simulated tweet ${i + 1}.`,
        source: "twitter"
      });
    }
  }
  return samples;
}

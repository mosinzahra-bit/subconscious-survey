interface CompletePageProps {
  params: { shareToken: string };
}

export default function CompletePage(_props: CompletePageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="badge mx-auto w-fit mb-2">Response recorded</p>
        <h1 className="font-heading text-2xl">
          Thank you for contributing to this study.
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This research focuses on rapid, subconscious categorization. Individual
          scores stay with the research team; what matters is the collective
          pattern across many participants like you.
        </p>
      </div>
    </main>
  );
}


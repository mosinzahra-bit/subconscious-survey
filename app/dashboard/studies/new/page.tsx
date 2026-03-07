import { Suspense } from "react";
import NewStudyClient from "./study-client";

export default function NewStudyPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-secondary)]">Preparing the study builder…</div>}>
      <NewStudyClient />
    </Suspense>
  );
}


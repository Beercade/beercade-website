import { redirect } from "next/navigation";

// What's on is hidden for now — event detail pages redirect home. Revert this
// change (the original page is in git history) to bring it back.
export default function EventDetailPage() {
  redirect("/");
}

import { redirect } from "next/navigation";

// What's on is hidden for now — this route redirects home. Revert this change
// (the original page is in git history) to bring it back.
export default function WhatsOnPage() {
  redirect("/");
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-crema focus:px-4 focus:py-2 focus:text-after-dark focus:outline-none"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

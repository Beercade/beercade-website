import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity/client";
import { allMachinesQuery, machineBySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { MachineDetail } from "@/components/machine/MachineDetail";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const machines = await sanityClient
    .fetch<{ slug: { current: string } }[]>(allMachinesQuery)
    .catch(() => []);
  return machines.map((m) => ({ slug: m.slug.current }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const machine = await sanityClient.fetch(machineBySlugQuery, {
    slug,
  });
  if (!machine) return {};

  return {
    title: machine.name,
    description: machine.description,
    openGraph: machine.photo
      ? {
          images: [
            urlFor(machine.photo).width(1200).height(630).auto("format").url(),
          ],
        }
      : undefined,
  };
}

export default async function MachineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const machine = await sanityClient.fetch(machineBySlugQuery, {
    slug,
  });

  if (!machine) notFound();

  return <MachineDetail {...machine} />;
}

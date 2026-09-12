import { createFileRoute } from "@tanstack/react-router";
import { ExplorerApp } from "@/components/app/ExplorerApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ExplorerApp />;
}

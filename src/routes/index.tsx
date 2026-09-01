import { createFileRoute } from "@tanstack/react-router";
import { WaitingApp } from "@/components/waiting-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <WaitingApp />;
}

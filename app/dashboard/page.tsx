import { redirect } from "next/navigation";

// The Command Center became the Watchboard (docs/spec/navigation.md).
export default function Dashboard() {
  redirect("/watchboard");
}

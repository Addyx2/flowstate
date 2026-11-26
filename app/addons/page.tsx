import { redirect } from "next/navigation";

// Add-ons became Elements (docs/spec/navigation.md).
export default function Addons() {
  redirect("/elements");
}

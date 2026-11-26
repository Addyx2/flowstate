import { redirect } from "next/navigation";

// Admin became Office (D18).
export default async function Admin({ params }: { params: Promise<{ rest?: string[] }> }) {
  const { rest } = await params;
  redirect(rest?.length ? `/office/${rest.join("/")}` : "/office/payroll");
}

import { Page, PageHeader } from "@/components/ui";
import { requireOffice } from "@/lib/auth";

import { Chat } from "./Chat";

export const metadata = { title: "Assist" };

export default async function AssistPage() {
  await requireOffice();
  return (
    <Page>
      <PageHeader
        eyebrow="PERSONA // ASSIST"
        title="Assist"
        intro="Ask about your agency, or tell Assist what to do. It looks things up straight away; anything that changes a rota waits for you to confirm."
      />
      <Chat />
    </Page>
  );
}

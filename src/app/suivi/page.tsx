import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function SuiviRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "fr";
  const params = await searchParams;
  const ref = params?.ref ? `?ref=${encodeURIComponent(params.ref)}` : "";
  redirect(`/${locale}/suivi${ref}`);
}

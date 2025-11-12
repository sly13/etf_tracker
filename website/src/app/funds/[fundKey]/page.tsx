import { redirect } from "next/navigation";
import { routing } from '../../../i18n/routing';

export const runtime = 'edge';

export default async function FundPage({
  params,
}: {
  params: Promise<{ fundKey: string }>;
}) {
  const { fundKey } = await params;
  redirect(`/${routing.defaultLocale}/funds/${fundKey}`);
}

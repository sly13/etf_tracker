import { redirect } from 'next/navigation';
import { routing } from '../../../i18n/routing';

export const runtime = 'edge';

export default async function IndexPage({
  params,
}: {
  params: Promise<{ indexType: string }>;
}) {
  const { indexType } = await params;
  // Редирект на локализованную версию
  redirect(`/${routing.defaultLocale}/indices/${indexType}`);
}


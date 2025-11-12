import { redirect } from 'next/navigation';
import { routing } from '../../i18n/routing';

export default async function BlogPage() {
  redirect(`/${routing.defaultLocale}/blog`);
}

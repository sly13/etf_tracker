import { redirect } from "next/navigation";
import { routing } from "../../i18n/routing";

export default async function FundsPage() {
  redirect(`/${routing.defaultLocale}/funds`);
}

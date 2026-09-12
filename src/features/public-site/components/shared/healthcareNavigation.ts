import type { HealthcareNavigationItem } from './types';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { getI18nPath } from '@/features/public-site/lib/helpers';

export function getHealthcareHref(
  item: HealthcareNavigationItem,
  locale: string = AppConfig.i18n.defaultLocale
) {
  return `${getI18nPath(item.path, locale)}${item.hash ?? ''}`;
}

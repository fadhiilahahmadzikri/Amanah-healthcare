import type { AssetImage } from '@/features/public-site/components/shared';

export type HealthcareSocials = {
  instagram?: string;
  linkedin?: string;
};

export type HealthcareTeamMember = {
  id: string;
  image: AssetImage;
  name: string;
  role: string;
  showSocials?: boolean;
  socials?: HealthcareSocials;
  instagramUrl?: string;
  linkedinUrl?: string;
};

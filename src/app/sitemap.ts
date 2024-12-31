import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: 'daily',
      lastModified: new Date(),
      priority: 0.7,
      url: `${getBaseUrl()}/`,
    },
    // Add more URLs here
  ];
}

import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';
import { toISOString } from '@/lib/utils'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: 'daily',
      lastModified: toISOString(new Date()),
      priority: 0.7,
      url: `${getBaseUrl()}/`
    }
    // Add more URLs here
  ]
}

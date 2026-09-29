import { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://duelux.store';

  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      productUrls = json.data.map((p: any) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Failed to generate dynamic sitemap:', err);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    ...productUrls,
  ];
}

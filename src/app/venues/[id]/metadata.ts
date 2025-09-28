import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`https://v2.api.noroff.dev/holidaze/venues/${params.id}`);
    if (!res.ok) throw new Error('Failed to fetch venue');
    
    const { data: venue } = await res.json();
    
    return {
      title: `${venue.name} - Holidaze`,
      description: venue.description,
      openGraph: {
        title: `${venue.name} - Holidaze`,
        description: venue.description,
        images: venue.media?.[0]?.url ? [venue.media[0].url] : [],
      },
    };
  } catch {
    return {
      title: 'Venue Details - Holidaze',
      description: 'View venue details and make a booking',
    };
  }
}
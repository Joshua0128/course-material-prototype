'use client';

import { AppLayout } from '@/components/app-layout';
import { ContentDetail } from '@/components/content-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <ContentDetail id={id} />
    </AppLayout>
  );
}

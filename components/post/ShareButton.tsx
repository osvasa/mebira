'use client';

import { ShareMenu } from '@/components/ui/ShareMenu';
import { formatNumber } from '@/lib/utils';

interface ShareButtonProps {
  postId: string;
  shareCount: number;
}

export function ShareButton({ postId, shareCount }: ShareButtonProps) {
  return (
    <ShareMenu
      path={`/post/${postId}`}
      title="Check out this travel recommendation on Osvasa"
      count={formatNumber(shareCount)}
    />
  );
}

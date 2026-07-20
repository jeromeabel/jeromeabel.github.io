import type { ComponentProps } from 'astro/types';
import WorkGalleryCard from './WorkGalleryCard.astro';
import { getFeaturedWorks } from '../../utils/repository';

const works = await getFeaturedWorks();

export default { component: WorkGalleryCard };

// workFeatured: gallery-2x2-1x1 / gallery-3col-1x1 → square card
// Note: the 2-col vs 3-col dimension is a **page-grid** layout decision (WorksStrip/featured section wrapper),
// not a WorkGalleryCard prop — the card itself only varies by `ratio`.
export const Square = {
  args: { work: works[0], ratio: 'square' } satisfies ComponentProps<typeof WorkGalleryCard>,
};

// workFeatured: gallery-2x2-16x9 → video (16:9) card
// Note: the 2-col vs 3-col dimension is a **page-grid** layout decision (WorksStrip/featured section wrapper),
// not a WorkGalleryCard prop — the card itself only varies by `ratio`.
export const Video = {
  args: { work: works[0], ratio: 'video' } satisfies ComponentProps<typeof WorkGalleryCard>,
};

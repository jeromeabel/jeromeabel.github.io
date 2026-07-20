import type { ComponentProps } from 'astro/types';
import WorkMiniCard from './WorkMiniCard.astro';
import { getFeaturedWorks } from '../../utils/repository';

const works = await getFeaturedWorks();

export default { component: WorkMiniCard };

export const MiniCard = {
  args: { work: works[0] } satisfies ComponentProps<typeof WorkMiniCard>,
};

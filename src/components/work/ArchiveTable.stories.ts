import type { ComponentProps } from "astro/types";
import ArchiveTable from "./ArchiveTable.astro";
import { getArchiveWorks } from "../../utils/repository";

const works = await getArchiveWorks();

export default { component: ArchiveTable };

export const Default = {
  args: { works } satisfies ComponentProps<typeof ArchiveTable>,
};

import ArchiveIndex from '@/components/ArchiveIndex'
import { loadArchiveProps } from '@/lib/site/archiveProps'

export async function getStaticProps({ locale }) {
  return loadArchiveProps(locale, !process.env.EXPORT)
}

export default ArchiveIndex

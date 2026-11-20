import JournalArticleCard from './JournalArticleCard'
import { toArticleCard } from '../homepage'

export function BlogItem({ post, keyword }) {
  const excerpt =
    keyword && !post.password
      ? post.results?.find(
          line =>
            typeof line === 'string' &&
            line.toLowerCase().includes(keyword.toLowerCase())
        ) || post.summary
      : ''
  return (
    <JournalArticleCard
      post={toArticleCard(post)}
      category={post.category}
      keyword={keyword}
      excerpt={excerpt}
    />
  )
}

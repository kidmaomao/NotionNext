export default function BlogPostBar({
  search,
  keyword,
  tag,
  category,
  postCount
}) {
  const heading = search ? '搜索文章' : tag ? '#' + tag : category || '所有文章'
  return (
    <header className='journal-page-heading'>
      <h1>{heading}</h1>
      {(!search || keyword) && (
        <p>
          {keyword && <>“{keyword}” · </>}共 {postCount} 篇文章
        </p>
      )}
    </header>
  )
}

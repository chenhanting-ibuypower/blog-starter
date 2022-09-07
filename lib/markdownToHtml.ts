import { remark } from 'remark'
import html from 'remark-html'
import prism from 'remark-prism';
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
      .use(remarkMdx)
      .use(remarkGfm) // Support GFM (tables, autolinks, tasklists, strikethrough).
      .use(prism)
      .use(html)
      .process(markdown)

  return result.toString()
}

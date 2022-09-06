import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

const POST = '_posts'
const postsDirectory = join(process.cwd(), POST)

export function getPostSlugs(directory) {
  let files = fs.readdirSync(directory)

  return files.reduce((acc: string[], file: string) => {
    const path = directory + "/" + file

    if(file.endsWith(".md")) {
      return [...acc, path]
    } else {
      return [...acc, ...getPostSlugs(path)]
    }
  }, [])
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  console.log("realSlug & fullPath:", realSlug, fullPath)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  type Items = {
    [key: string]: string
  }

  const items: Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field]
    }
  })

  return items
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs(postsDirectory).map((file: string) => file.split("/" + POST + "/")[1])
  /* slugs: [ 'dynamic-routing.md', 'hello-world.md', 'preview.md' ] */
  console.log("slugs: ", slugs)

  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}

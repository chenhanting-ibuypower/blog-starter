import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'
import type PostType from '../../interfaces/post'
import {getFolderNestedData} from "@/lib/nestedPath";
import { POST } from "@/constant/project";

type Props = {
  post: PostType
  morePosts: PostType[]
  preview?: boolean
  allDocsNestedData: any
}

export default function Post({ post, morePosts, preview, allDocsNestedData }: Props) {
  const router = useRouter()

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  console.log("post:", post)


  return (
    <Layout preview={preview} allDocsNestedData={allDocsNestedData}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
                  {post.title} | Next.js Blog Example with {CMS_NAME}
                </title>
                <meta property="og:image" content={post.ogImage?.url} />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post?.author}
              />
              <PostBody content={post.content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  )
}

type Params = {
  params: {
    slug: string[]
  }
}

export async function getStaticProps({ params }: Params) {
  const allDocsNestedData = await getFolderNestedData(POST);

  const post = getPostBySlug(params.slug.join("/"), [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
      allDocsNestedData
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])
  console.log("posts: ", posts)

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug.split("/"),
        },
      }
    }),
    fallback: false,
  }
}

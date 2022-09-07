import Alert from './alert'
import Footer from './footer'
import Meta from './meta'
// @ts-ignore
import MarkdownTreeView from "./markdownTreeView"

type Props = {
  preview?: boolean
  allDocsNestedData: any
  children: React.ReactNode
}

const Layout = ({ preview, children, allDocsNestedData }: Props) => {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <Alert preview={preview} />
        <div className="md:flex">
            <header className="min-w-60 basis-60 grow border-dashed border-b-8 md:border-b-0 md:border-r-4 border-black md:min-h-screen">
                <MarkdownTreeView allDocsNestedData={allDocsNestedData} />
            </header>
            <main className="line-numbers basis-0 grow-999 min-w-[66%]">
                {children}
            </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Layout

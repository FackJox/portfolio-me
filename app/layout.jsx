import { Layout } from '@/components/dom/Layout'
import '@/global.css'
import { Provider } from 'jotai'

const title = "Jack Fox Portfolio"
const url =  process.env.NODE_ENV ==="development" ? 'http://localhost:3000' : 'https://jackfox.dev'
const description = 'Engineer and Creative'
const author = 'Jack Fox'

/**
 * @type {import('next').Viewport}
 */
export const viewport = {
  themeColor: 'black',
}

/**
 * @type {import('next').Metadata}
 */

export const metadata = {
  title: title,
  description: description,
  authors: [{ name: author, url: 'https://jackfox.dev' }],
  publisher: author,
  keywords: 'Software Engineer,Product Manager,Project Manager,Data Scientist,Computer Scientist',
  robots: 'index,follow',
  metadataBase: url,
  openGraph: {
    title: title,
    type: 'website',
    url: url,
    images: [{ url: '/icons/share.png', width: 800, height: 800 }],
    siteName: title,
    description: description,
  },
  manifest: '/manifest.json',
  formatDetection: { email: true, telephone: true },
  icons: {
    icon: [{ url: '/icons/favicon.ico' }, { url: '/icons/favicon-32x32.png', type: 'image/png' }],
    shortcut: ['/icons/apple-touch-icon.png'],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [{ rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#000000' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <Provider>
          <Layout>{children}</Layout>
        </Provider>
      </body>
    </html>
  )
}

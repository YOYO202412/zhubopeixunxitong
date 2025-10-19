// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* 字体图标样式表 */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        {/* 其他全局样式表可以在这里添加 */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
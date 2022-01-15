import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { generateStaticPath } from '../util/staticPathUtil';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {

    return (
      <html>
        <Head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta name="robots" content="index,follow" />
          <meta name="author" content="Fictionio" />
          <meta name="description" content="Read fiction online for free at Fictionio with no ads!" />
          <meta name="keywords" itemProp="keywords" content="Fiction, Read Fiction, Novel Online, Read Novel, Free Novel, Fictionio" />
          <meta name="theme-color" content="#272b30" />
          <meta property="og:site_name" content="Fictionio" />
          <meta property="og:title" content="Home - Fictionio" />
          <meta property="og:image" content="https://fictionio.com/images/misc/default_brand.png?1" />
          <meta property="og:url" content="https://fictionio.com/" />
          <meta property="og:description" content="Read fiction online for free at Fictionio with no ads!" />
          <meta property="og:type" content="website" />
          <meta name="twitter:site" content="@fictionio" />
          <link rel="icon" type="image/png" sizes="96x96" href="https://fictionio.com/favicon-96x96.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="https://fictionio.com/favicon-192x192.png" />

          <link rel="stylesheet" type="text/css" href={generateStaticPath('/bootstrap/css/bootstrap.min.css')} />
          <link rel="stylesheet" type="text/css" href={generateStaticPath('/fontawesome/css/all.min.css')} />
          <link rel="stylesheet" type="text/css" href={generateStaticPath('/css/react-draft-rich-editor.css')} />
          <link rel="stylesheet" type="text/css" href={generateStaticPath('/fictionio.css')} />
          <script type="text/javascript" src={generateStaticPath('/jquery.min.js')} />
        </Head>
        <body data-gr-c-s-loaded="true">
          <Main />
          <NextScript />
          <script type="text/javascript" src={generateStaticPath('/bootstrap/js/bootstrap.bundle.min.js')} />
          <script type="text/javascript" src={generateStaticPath('/fontawesome/js/fontawesome.min.js')} />
          <script type="text/javascript" src={generateStaticPath('/fontawesome/js/solid.min.js')} />
        </body>
      </html>
    );
  }
}

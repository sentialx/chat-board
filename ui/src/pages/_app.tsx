import * as classValidator from "class-validator";
import * as deepMerge from "deepmerge";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import * as objectHash from "object-hash";
import { useEffect } from "react";

import {
  FONT_INTER_BOLD,
  FONT_INTER_EXTRA_BOLD,
  FONT_INTER_MEDIUM,
  FONT_INTER_REGULAR,
} from "../constants/fonts";
import { AUTH_ROUTE } from "../constants/routes";
import { useStore } from "../store/app_store_provider";
import { GlobalStyle } from "../views/style";

const GLOBAL_STYLE = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(${FONT_INTER_REGULAR}) format('woff2') 400;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(${FONT_INTER_MEDIUM}) format('woff2') 500;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(${FONT_INTER_BOLD}) format('woff2') 600;
}

@font-face {
  font-family: 'Inter';
  src: url(${FONT_INTER_EXTRA_BOLD}) format('woff2') 700;
  font-style: normal;
  font-display: swap;
  font-weight: 700;
}
`;

const publicPaths = [AUTH_ROUTE, "/[handle]", "/profile/[handle]", "/privacy"];

const shouldRedirect = (pathname: string) => {
  return !publicPaths.some((x) => pathname.startsWith(x));
};

function CustomApp({ Component, pageProps }: AppProps) {
  const store = useStore();
  const router = useRouter();
  const ref = router.query["ref"] as string;

  useEffect(() => {
    if (ref != null) {
      store.apiClient.referer = ref;
    }
  }, [ref]);

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        await store.apiClient.getMe();
      } catch (error) {
        if (shouldRedirect(router.pathname)) {
          window.location.href = `${AUTH_ROUTE}?redirect=${router.pathname}`;
        }
      }
    };
    fetch();
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Podróba Slacka</title>
        <meta
          key="description"
          name="description"
          content="We help influencers create their AI versions."
        />
        <meta
          name="keywords"
          content="ai, influencer, creator, digital, diffusion, chatbot, instagram, fans, onlyfans, fansly, pateron, influence, artificial, intelligence"
        />
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLE }} />
        <link
          rel="preload"
          href={FONT_INTER_REGULAR}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_MEDIUM}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_BOLD}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_EXTRA_BOLD}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
        />
        {/* <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0"
        /> */}
        <meta name="overscroll-behavior-y" content="none" />
        <meta
          key="og:image"
          property="og:image"
          content="/resources/og-image.jpg"
        />
        <meta key="og:site_name" property="og:site_name" content="BlazeFlow" />
        <meta key="og:url" property="og:url" content="https://blazeflow.co" />
        <meta key="og:locale" property="og:locale" content="en_US" />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:title"
          property="og:title"
          content="BlazeFlow - Enchant your influence with AI"
        />
        <meta
          key="og:description"
          property="og:description"
          content="We help influencers create their AI versions."
        />
      </Head>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-DDY5W2NR6M"
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-DDY5W2NR6M', {
          user_id: '${store.trackingHandle}',
        });
      `,
        }}
      ></script>
      <GlobalStyle />
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;

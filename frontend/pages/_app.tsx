import type { AppProps } from "next/app";
import Layout from "@/components/Layout"; // Import Layout

import "@/styles/globals.css"; // Ensure styles are applied

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

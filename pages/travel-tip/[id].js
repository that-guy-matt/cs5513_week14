import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import TravelPostDetail from '../../components/travel-post-detail';
import { TRAVEL_POST_TYPES } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

// This file renders an individual "travel tip" post page
const TYPE_KEY = 'travel-tip';

export async function getStaticPaths() {
  // Import helper to fetch all IDs for this post type
  const { getAllPostIdsByType } = await import('../../lib/posts');

  // Generate all paths for static generation at build time
  const paths = await getAllPostIdsByType(TYPE_KEY);

  return {
    paths,
    // 'blocking' allows on-demand SSR for new posts not yet generated
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  // Import helper to fetch full post data by ID
  const { getTravelPostData } = await import('../../lib/posts');

  // Load the specific travel tip using the dynamic route param
  const post = await getTravelPostData(TYPE_KEY, params.id);

  // If no post exists, return 404 and allow quick revalidation
  if (!post) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  return {
    props: {
      post, // Pass post content to component
    },
    revalidate: 300, // ISR: revalidate every 5 minutes
  };
}

export default function TravelTipPost({ post }) {
  // Config for this post type (paths, labels, etc.)
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  return (
    <Layout>
      <Head>
        {/* Page title: use post title if available, otherwise type label */}
        <title>{post?.title || config.label}</title>
      </Head>

      {/* Shared detailed post layout component */}
      <TravelPostDetail post={post} config={config} />

      {/* Back link to the list page */}
      <section className={utilStyles.headingMd}>
        <Link href={config.listPath}>← Back to {config.label}</Link>
      </section>
    </Layout>
  );
}

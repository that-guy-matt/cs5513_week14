import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import TravelPostDetail from '../../components/travel-post-detail';
import { TRAVEL_POST_TYPES } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

const TYPE_KEY = 'restaurant';

export async function getStaticPaths() {
  const { getAllPostIdsByType } = await import('../../lib/posts');
  const paths = await getAllPostIdsByType(TYPE_KEY);
  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { getTravelPostData } = await import('../../lib/posts');
  const post = await getTravelPostData(TYPE_KEY, params.id);

  if (!post) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 300,
  };
}

export default function RestaurantPost({ post }) {
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  return (
    <Layout>
      <Head>
        <title>{post?.title || config.label}</title>
      </Head>

      <TravelPostDetail post={post} config={config} />

      <section className={utilStyles.headingMd}>
        <Link href={config.listPath}>← Back to {config.label}</Link>
      </section>
    </Layout>
  );
}


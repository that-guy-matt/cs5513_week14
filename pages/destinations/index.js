import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

// This page lists *all* posts of type "destination".
const TYPE_KEY = 'destination';

export async function getStaticProps() {
  // Dynamically import post utilities (keeps bundle smaller)
  const { getPostsByType } = await import('../../lib/posts');

  // Fetch all posts belonging to this post type
  const posts = await getPostsByType(TYPE_KEY);

  return {
    props: {
      posts, // Pass posts to the page component
    },
    revalidate: 300, // ISR: Rebuild page every 5 minutes
  };
}

export default function DestinationsPage({ posts }) {
  // Get metadata/config for the destination post type
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  // Build a list of other post types (for "More travel content" section)
  const otherTypes = TRAVEL_POST_TYPE_KEYS.filter((key) => key !== TYPE_KEY);

  return (
    <Layout>
      {/* Set the HTML <title> */}
      <Head>
        <title>{config.label}</title>
      </Head>

      {/* Hero/header section for the listing */}
      <section className={utilStyles.listHero}>
        <h1 className={utilStyles.headingLg}>{config.label}</h1>
        <p>
          Discover bucket-list locations, learn what to expect on the ground,
          and bookmark your next adventure.
        </p>
      </section>

      {/* List all destination posts */}
      <section className={utilStyles.headingMd}>
        <ul className={utilStyles.list}>
          {posts.map((post) => (
            <li className={utilStyles.listItem} key={post.id}>
              {/* Link to the detail page for this destination */}
              <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
              <br />

              {/* Extra metadata (date + optional fields) */}
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                <Date dateString={post.date} />
                {post.fields.country && ` • ${post.fields.country}`}
                {post.fields.attraction_type && ` • ${post.fields.attraction_type}`}
              </small>
            </li>
          ))}
        </ul>
      </section>

      {/* Section showing other travel content categories */}
      <section className={utilStyles.headingMd}>
        <h2 className={utilStyles.headingLg}>More travel content</h2>
        <ul className={`${utilStyles.list} ${utilStyles.subList}`}>
          {otherTypes.map((typeKey) => (
            <li className={utilStyles.subListItem} key={typeKey}>
              <Link href={TRAVEL_POST_TYPES[typeKey].listPath}>
                {TRAVEL_POST_TYPES[typeKey].label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

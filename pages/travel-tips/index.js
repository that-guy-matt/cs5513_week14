import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

// This page lists all posts for the “travel tip” post type
const TYPE_KEY = 'travel-tip';

export async function getStaticProps() {
  // Dynamically import helper to fetch posts for this type
  const { getPostsByType } = await import('../../lib/posts');

  // Load all travel-tip posts
  const posts = await getPostsByType(TYPE_KEY);

  return {
    props: {
      posts, // Array of posts for this list page
    },
    revalidate: 300, // ISR: Rebuild the page every 5 minutes
  };
}

export default function TravelTipsPage({ posts }) {
  // Config for this post type (paths, labels, etc.)
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  // Determine the other post types so we can link to them
  const otherTypes = TRAVEL_POST_TYPE_KEYS.filter((key) => key !== TYPE_KEY);

  return (
    <Layout>
      <Head>
        {/* Page title uses the readable label for this post type */}
        <title>{config.label}</title>
      </Head>

      {/* Page header / hero section */}
      <section className={utilStyles.listHero}>
        <h1 className={utilStyles.headingLg}>{config.label}</h1>
        <p>Practical advice for every stage of the journey, from packing to arrival.</p>
      </section>

      {/* List of all travel-tip posts */}
      <section className={utilStyles.headingMd}>
        <ul className={utilStyles.list}>
          {posts.map((post) => (
            <li className={utilStyles.listItem} key={post.id}>
              {/* Link to the individual travel-tip detail page */}
              <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
              <br />
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                {/* Date component formats the post date */}
                <Date dateString={post.date} />

                {/* Show taxonomy fields if they exist */}
                {post.fields.category && ` • ${post.fields.category}`}
                {post.fields.difficulty && ` • ${post.fields.difficulty}`}
              </small>
            </li>
          ))}
        </ul>
      </section>

      {/* Links to other post type list pages */}
      <section className={utilStyles.headingMd}>
        <h2 className={utilStyles.headingLg}>Plan the rest</h2>
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

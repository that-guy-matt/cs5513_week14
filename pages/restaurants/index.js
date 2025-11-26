import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

const TYPE_KEY = 'restaurant';

export async function getStaticProps() {
  const { getPostsByType } = await import('../../lib/posts');
  const posts = await getPostsByType(TYPE_KEY);

  return {
    props: {
      posts,
    },
    revalidate: 300,
  };
}

export default function RestaurantsPage({ posts }) {
  const config = TRAVEL_POST_TYPES[TYPE_KEY];
  const otherTypes = TRAVEL_POST_TYPE_KEYS.filter((key) => key !== TYPE_KEY);

  return (
    <Layout>
      <Head>
        <title>{config.label}</title>
      </Head>

      <section className={utilStyles.listHero}>
        <h1 className={utilStyles.headingLg}>{config.label}</h1>
        <p>Hand-picked spots to eat and drink around the world.</p>
      </section>

      <section className={utilStyles.headingMd}>
        <ul className={utilStyles.list}>
          {posts.map((post) => (
            <li className={utilStyles.listItem} key={post.id}>
              <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
              <br />
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                <Date dateString={post.date} />
                {post.fields.cuisine && ` • ${post.fields.cuisine}`}
                {post.fields.price_range && ` • ${post.fields.price_range}`}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section className={utilStyles.headingMd}>
        <h2 className={utilStyles.headingLg}>Keep exploring</h2>
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


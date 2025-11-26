import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

const TYPE_KEY = 'travel-tip';

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

export default function TravelTipsPage({ posts }) {
  const config = TRAVEL_POST_TYPES[TYPE_KEY];
  const otherTypes = TRAVEL_POST_TYPE_KEYS.filter((key) => key !== TYPE_KEY);

  return (
    <Layout>
      <Head>
        <title>{config.label}</title>
      </Head>

      <section className={utilStyles.headingMd}>
        <h1 className={utilStyles.headingLg}>{config.label}</h1>
        <p>Practical advice for every stage of the journey, from packing to arrival.</p>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <ul className={utilStyles.list}>
          {posts.map((post) => (
            <li className={utilStyles.listItem} key={post.id}>
              <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
              <br />
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                <Date dateString={post.date} />
                {post.fields.category && ` • ${post.fields.category}`}
                {post.fields.difficulty && ` • ${post.fields.difficulty}`}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section className={utilStyles.headingMd}>
        <h2 className={utilStyles.headingLg}>Plan the rest</h2>
        <ul className={utilStyles.list}>
          {otherTypes.map((typeKey) => (
            <li className={utilStyles.listItem} key={typeKey}>
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


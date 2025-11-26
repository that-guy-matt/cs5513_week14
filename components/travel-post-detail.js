import Date from './date';
import styles from './travel-post-detail.module.css';

const EXCLUDED_CARD_FIELDS = new Set(['image', 'summary', 'description', 'tip_text']);

export default function TravelPostDetail({ post, config }) {
  if (!post) {
    return null;
  }

  const detailFields = (config.detailFields || []).filter(
    (field) => !EXCLUDED_CARD_FIELDS.has(field.key)
  );

  return (
    <article className={styles.detail}>
      <div className={styles.heading}>
        <p className={styles.type}>{config.label}</p>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <Date dateString={post.date} />
        </div>
      </div>

      {post.image && (
        <div className={styles.hero}>
          <img src={post.image} alt={`${post.title} illustration`} />
        </div>
      )}

      {detailFields.length > 0 && (
        <section className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Trip details</h2>
          <dl className={styles.fields}>
            {detailFields.map((field) => {
              const rawValue = post.fields[field.key];
              const valueContent = rawValue || 'Not provided';

              return (
                <div className={styles.field} key={field.key}>
                  <dt className={styles.fieldLabel}>{field.label}</dt>
                  <dd className={styles.fieldValue}>{valueContent}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      )}

      {post.excerpt && (
        <section className={styles.summary}>
          <h2>Description</h2>
          <p>{post.excerpt}</p>
        </section>
      )}
    </article>
  );
}


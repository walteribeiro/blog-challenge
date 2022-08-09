/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetStaticPaths, GetStaticProps } from 'next';
import * as PrismicHelpers from '@prismicio/helpers';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '..';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const words = post.data.content.reduce(
    (accumulator, currentValue) => [...accumulator, ...currentValue.body],
    []
  );

  const totalWordsOfBody = PrismicHelpers.asText(words as any).split(
    ' '
  ).length;

  const totalWordsOfHeading = post.data.content.reduce(
    (accumulator, currentValue) => {
      if (currentValue.heading) {
        return [...accumulator, ...currentValue.heading.split(' ')];
      }

      return [...accumulator];
    },
    []
  ).length;

  const readingTime = Math.ceil((totalWordsOfBody + totalWordsOfHeading) / 200);

  return (
    <>
      <section className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </section>
      <main className={commonStyles.content}>
        <article className={styles.post}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <span>
              <FiCalendar size={16} />
              <time>{formatDate(post.first_publication_date)}</time>
            </span>
            <span>
              <FiUser size={16} />
              <span>{post.data.author}</span>
            </span>
            <span>
              <FiClock size={16} />
              <span>{readingTime} min</span>
            </span>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <section key={heading}>
                {heading && <h2>{heading}</h2>}
                <div
                  className={styles.postData}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: PrismicHelpers.asHTML(body as any),
                  }}
                />
              </section>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 5,
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  return {
    props: {
      post: response,
    },
  };
};

// Seed script: wipes the blog tables and fills them with sample content.
// Run with `npm run db:seed`. Safe to run again: it starts from empty tables.
//
// Creates one author account (maria) and four published posts plus one draft,
// with a few comments, so both front-ends have something real to show.

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AUTHOR_USERNAME = 'maria';
const AUTHOR_PASSWORD = process.env.SEED_AUTHOR_PASSWORD || 'maria1234';

// Dates are spread out so the feed reads like a real archive.
const day = (iso) => new Date(`${iso}T09:00:00.000Z`);

async function main() {
  console.log('[seed] clearing old rows...');
  // Order matters: comments reference posts, posts reference users.
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] creating the author account...');
  const passwordHash = await bcrypt.hash(AUTHOR_PASSWORD, 10);
  const author = await prisma.user.create({
    data: {
      username: AUTHOR_USERNAME,
      passwordHash,
      role: 'AUTHOR',
    },
  });

  console.log('[seed] creating posts...');
  const posts = [
    {
      title: 'I split my blog into three apps. Here is what broke first.',
      content: [
        'One Express API, one reader site, one author dashboard. Three folders, three package.json files, one Postgres database.',
        '',
        'The first break was not the code. It was the token. The dashboard stored it in localStorage and sent it on every request, and the reader site sent nothing at all, so a post saved as a draft appeared in the admin table and nowhere else. That was correct behaviour. It just looked like a bug for ten minutes.',
        '',
        'The second break was CORS. A browser will not send an Authorization header to a different origin unless the server answers the preflight request with the right headers. Postman never sends a preflight, so every route worked there and every protected route failed in the browser. If you only remember one thing from this post, remember that.',
        '',
        'What I would do differently: write the curl tests before the controllers. Two of the bugs above were found by curl, in about a minute, after I had already spent an hour clicking around a broken form.',
      ].join('\n'),
      published: true,
      tags: ['node.js', 'express', 'prisma', 'react'],
      createdAt: day('2026-11-15'),
      authorId: author.id,
    },
    {
      title: 'Why does my JWT work in Postman but not in the browser?',
      content: [
        'My API returned a token on login and every protected route worked perfectly in Postman. In the browser, the same request came back with a 401. Same token, same URL.',
        '',
        'The difference was the preflight request. Browsers send an OPTIONS request first when a request carries a custom header like Authorization, and my server was not answering it.',
        '',
        'The request the browser was making looked like this:',
        '',
        'fetch(url, {\n  headers: { Authorization: `Bearer ${token}` }\n})',
        '',
        'Allowing that header in the CORS configuration fixed it, together with answering OPTIONS on every path. Lesson learned: when Postman works and the browser does not, look at the network tab first. The answer is usually in the request the browser sent that Postman never did.',
      ].join('\n'),
      published: true,
      tags: ['node.js', 'auth'],
      createdAt: day('2026-11-12'),
      authorId: author.id,
    },
    {
      title: 'Prisma schemas for a blog: posts, comments and a published flag',
      content: [
        'Three models, two relations, and one boolean that decides whether a post is a draft or a live article.',
        '',
        'Post belongs to User through authorId. Comment belongs to Post through postId, and it carries an authorName string instead of a User id, because commenting does not require an account.',
        '',
        'The published flag is a plain boolean with a default of false. Every public query filters on it, so a draft can never leak out of GET /posts by accident. A status string would have been more flexible, but a blog needs exactly two states and a boolean cannot grow a third one by mistake.',
        '',
        'The one thing to watch: when you delete a post, its comments go with it. That is set on the relation with onDelete: Cascade, so there is no orphan data to clean up later.',
      ].join('\n'),
      published: true,
      tags: ['prisma', 'databases'],
      createdAt: day('2026-11-09'),
      authorId: author.id,
    },
    {
      title: 'Keeping the admin dashboard honest about what is published',
      content: [
        'A small list view that shows drafts and live posts at a glance saves a lot of "did I publish that?" moments.',
        '',
        'The table shows the title, a status pill, the last updated date and three buttons. The pill says Published or Draft in words, not only in colour, because a colour alone is no label at all and about one in twelve men cannot tell the green from the amber.',
        '',
        'The publish button is a PATCH request that flips the flag on the server. The dashboard does not guess the new status and then update the row locally, it shows what the API returned. One source of truth, fewer surprises.',
      ].join('\n'),
      published: true,
      tags: ['react', 'ui'],
      createdAt: day('2026-11-04'),
      authorId: author.id,
    },
    {
      title: 'Moderating comments without writing a moderation system',
      content: [
        'Delete, edit, done. A solo blogger does not need a full moderation queue with scores and flags.',
        '',
        'Comments here are public: anyone types a name and a comment and it appears. The only tool the author gets is a list of everything said, with an edit button for fixing a mistake and a delete button for removing spam.',
        '',
        'That is the whole feature. If the blog ever grows past a few dozen comments a day, it will need something more, but until then this is the right size.',
      ].join('\n'),
      published: true,
      tags: ['express', 'rest'],
      createdAt: day('2026-10-30'),
      authorId: author.id,
    },
    {
      title: 'A draft on purpose: what a 404 should say',
      content: [
        'Draft post, kept unpublished so the reader site has something that must NOT appear in the feed.',
        '',
        'When the reader asks for this post by id, the API answers 404, because drafts are not public. The message is deliberately the same as a deleted post, so nobody can guess at unpublished titles by watching the error text.',
        '',
        'This is a good route to test first: if it shows up on the home page, the published filter is broken.',
      ].join('\n'),
      published: false,
      tags: ['rest'],
      createdAt: day('2026-11-16'),
      authorId: author.id,
    },
  ];

  const created = [];
  for (const post of posts) {
    created.push(await prisma.post.create({ data: post }));
  }

  console.log('[seed] creating comments...');
  const findByTitleStart = (start) => created.find((p) => p.title.startsWith(start));

  const jwtPost = findByTitleStart('Why does my JWT');
  const splitPost = findByTitleStart('I split my blog');

  await prisma.comment.createMany({
    data: [
      {
        postId: jwtPost.id,
        authorName: 'Ana Lim',
        content: 'The OPTIONS thing got me too. Thanks for writing it down.',
        createdAt: day('2026-11-13'),
      },
      {
        postId: jwtPost.id,
        authorName: 'Kenji Sato',
        content: 'Do you store the token in localStorage or a cookie?',
        createdAt: day('2026-11-13'),
      },
      {
        postId: jwtPost.id,
        authorName: 'Jon Dela Cruz',
        content: 'LocalStorage, as the assignment suggests. Cookies are on my list for later.',
        createdAt: day('2026-11-14'),
      },
      {
        postId: splitPost.id,
        authorName: 'Ana Lim',
        content: 'Three apps really is the simplest version of this. One repo, three folders.',
        createdAt: day('2026-11-15'),
      },
      {
        postId: splitPost.id,
        authorName: 'Kenji Sato',
        content: 'How are you keeping the token out of the reader site entirely?',
        createdAt: day('2026-11-16'),
      },
      {
        postId: findByTitleStart('Keeping the admin').id,
        authorName: 'Kenji Sato',
        content: 'The status pill with a word in it is the detail most dashboards miss.',
        createdAt: day('2026-11-05'),
      },
    ],
  });

  console.log(`[seed] done: 1 author, ${created.length} posts, 6 comments.`);
  console.log(`[seed] log in as "${AUTHOR_USERNAME}" with password "${AUTHOR_PASSWORD}".`);
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

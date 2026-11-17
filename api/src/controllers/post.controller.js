// Public + author post controllers.
// Public routes only ever see posts where published = true.

// Prisma "select" reuse: the author is always just a name on screen.
const authorSelect = { id: true, username: true };

export function makePostController(prisma) {
  // GET /posts  -> published only, newest first, no full body (it is long).
  const listPublished = async (req, res) => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    // A "summary" is the first ~200 characters of the body, useful for the feed.
    const shaped = posts.map((p) => {
      const summary = p.content.replace(/\s+/g, ' ').slice(0, 200).trim();
      return {
        id: p.id,
        title: p.title,
        summary: summary + (p.content.length > 200 ? '…' : ''),
        published: p.published,
        tags: p.tags,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        author: p.author,
        commentCount: p._count.comments,
      };
    });

    res.json({ posts: shaped });
  };

  // GET /posts/:id -> a published post, or 404 for drafts (they are not public).
  const getPublished = async (req, res, next) => {
    const id = Number(req.params.id);
    const post = await prisma.post.findFirst({
      where: { id, published: true },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });
    if (!post) return next(require404());

    res.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        tags: post.tags,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        commentCount: post._count.comments,
      },
    });
  };

  // GET /admin/posts -> every post, drafts included, with comment counts.
  const listAll = async (_req, res) => {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });
    res.json({
      posts: posts.map((p) => ({
        ...p,
        commentCount: p._count.comments,
        _count: undefined,
      })),
    });
  };

  // POST /posts -> create. Authors can save a draft or publish straight away.
  const create = async (req, res) => {
    const { title, content, published, tags } = req.body;
    const post = await prisma.post.create({
      data: { title, content, published, tags, authorId: req.user.id },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
      },
    });
    res.status(201).json({ post });
  };

  // PUT /posts/:id -> full update of title/content/published/tags.
  const update = async (req, res) => {
    const id = Number(req.params.id);
    const { title, content, published, tags } = req.body;
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        ...(published === undefined ? {} : { published }),
        ...(tags === undefined ? {} : { tags }),
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: { select: authorSelect },
      },
    });
    res.json({ post });
  };

  // DELETE /posts/:id -> removes the post and its comments (cascade).
  const remove = async (req, res) => {
    const id = Number(req.params.id);
    // deleteMany reports a count, so we can answer 404 cleanly instead of
    // relying on a thrown P2025.
    const { count } = await prisma.post.deleteMany({ where: { id } });
    if (count === 0) return res.status(404).json({ error: 'Post not found.' });
    res.status(204).send();
  };

  // PATCH /posts/:id/publish -> flip the flag, or set it if a body says so.
  const togglePublish = async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.post.findUnique({ where: { id }, select: { published: true } });
    if (!existing) return res.status(404).json({ error: 'Post not found.' });

    const published = req.body.published ?? !existing.published;
    const post = await prisma.post.update({
      where: { id },
      data: { published },
      select: { id: true, title: true, published: true, updatedAt: true },
    });
    res.json({ post });
  };

  return { listPublished, getPublished, listAll, create, update, remove, togglePublish };
}

// Tiny helper so the controller file does not import the error class just for a 404.
function require404() {
  const err = new Error('Post not found. It may be a draft, or it may have been deleted.');
  err.status = 404;
  return err;
}

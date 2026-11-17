// Comment controllers.
// Anyone can read and add a comment on a PUBLISHED post (no login).
// Only the author (any AUTHOR account) can edit or delete one afterwards.

export function makeCommentController(prisma) {
  const shape = (c) => ({
    id: c.id,
    content: c.content,
    authorName: c.authorName,
    createdAt: c.createdAt,
    postId: c.postId,
  });

  // GET /posts/:id/comments -> oldest first, like a conversation.
  const listForPost = async (req, res, next) => {
    const postId = Number(req.params.id);
    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
      select: { id: true },
    });
    if (!post) return next(asNotFound('Post not found, or it is not published yet.'));

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ comments: comments.map(shape) });
  };

  // POST /posts/:id/comments -> returns 201 with the saved comment.
  const createForPost = async (req, res, next) => {
    const postId = Number(req.params.id);
    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
      select: { id: true },
    });
    if (!post) return next(asNotFound('You cannot comment on a post that is not published.'));

    const { authorName, content } = req.body;
    const comment = await prisma.comment.create({
      data: { authorName, content, postId },
    });
    res.status(201).json({ comment: shape(comment) });
  };

  // PUT /comments/:id -> author-onlyedit (fix a typo, remove junk).
  const update = async (req, res, next) => {
    const id = Number(req.params.id);
    const existing = await prisma.comment.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return next(asNotFound('Comment not found.'));

    const { authorName, content } = req.body;
    const comment = await prisma.comment.update({
      where: { id },
      data: {
        ...(authorName === undefined ? {} : { authorName }),
        ...(content === undefined ? {} : { content }),
      },
    });
    res.json({ comment: shape(comment) });
  };

  // DELETE /comments/:id -> 204, or 404.
  const remove = async (req, res) => {
    const id = Number(req.params.id);
    const { count } = await prisma.comment.deleteMany({ where: { id } });
    if (count === 0) return res.status(404).json({ error: 'Comment not found.' });
    res.status(204).send();
  };

  // GET /admin/comments -> moderation list, newest first, with the post title.
  const listAll = async (_req, res) => {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { id: true, title: true } } },
    });
    res.json({
      comments: comments.map((c) => ({
        ...shape(c),
        post: c.post,
      })),
    });
  };

  return { listForPost, createForPost, update, remove, listAll };
}

function asNotFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

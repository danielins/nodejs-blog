const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[postId] || [];

  comments.push({
    id: commentId,
    content,
    status: 'pending',
  });

  commentsByPostId[postId] = comments;

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId,
      status: 'pending',
    }
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  
  console.log('Received Event:', type);

  if ( type === 'CommentModerated' ){
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => {
      return comment.id === id;
    });
    comment.status = status;

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        content,
        status,
      }
    }).catch(error => console.log(error.message));
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('[COMMENTS] Listening on 4001');
})
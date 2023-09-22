const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const MODERATION_PORT = 4003;

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if ( type === 'CommentCreated' ){
    const { id, postId, content } = data;
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://localhost:4005/events', {
      type: 'CommentModerated',
      data: {
        id,
        postId,
        content,
        status,
      }
    }).catch(error => console.log(error));
  }

  res.send({});
});

app.listen(MODERATION_PORT, () => {
  console.log(`[MODERATION] Listening on ${MODERATION_PORT}`);
});
const express = require('express');
const request = require('request');
const app = express();

app.use(express.json());

app.get('/api/professors', (req, res) => {
  const searchQuery = req.query.q;
  const url = `https://www.ratemyprofessors.com/search/professors/1074?q=${searchQuery}`;
  
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log(url);
      res.send(body);
    } else {
      res.status(response.statusCode).send(error);
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

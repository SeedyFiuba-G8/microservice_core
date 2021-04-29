import express from 'express';
import config from './const/config';

const app = express();

app.get('/', (req, res) => {
    res.send('Feliz cumple santi');
});

const port = process.env.PORT || config.port;

app.listen(port, () => {
    console.log('The application is listening on port 3000!');
});

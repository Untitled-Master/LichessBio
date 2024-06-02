import express from 'express';
import fetch from 'node-fetch';
import { create } from 'xmlbuilder2';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/lichess-stats/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const response = await fetch(`https://lichess.org/api/user/${username}`);
        const data = await response.json();

        const seenAt = new Date(data.seenAt);
        const now = new Date();
        const timeDiff = now - seenAt;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        const svg = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 500, height: 300 })
                .ele('rect', { width: '100%', height: '100%', fill: '#363636' }).up()
                .ele('text', { x: 20, y: 40, fill: '#f5f5f5', 'font-size': 24 })
                    .txt(`User: ${data.username}`).up()
                .ele('text', { x: 20, y: 70, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Online: ${days} days, ${hours} h, and ${minutes} min ago`).up()
                .ele('text', { x: 20, y: 100, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Rapid: ${data.perfs.rapid.rating}`).up()
                .ele('text', { x: 20, y: 130, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Blitz: ${data.perfs.blitz.rating}`).up()
                .ele('text', { x: 20, y: 160, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Bullet: ${data.perfs.bullet.rating}`).up()
                .ele('text', { x: 20, y: 190, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Playtime: ${Math.floor(data.playTime.total / (60 * 60 * 1000))} hours`).up()
            .end({ prettyPrint: true });

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import fetch from 'node-fetch';
import { create } from 'xmlbuilder2';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/lichess-stats/:username', async (req, res) => {
    const { username } = req.params;
    console.log(`Fetching data for user: ${username}`);

    try {
        const response = await fetch(`https://lichess.org/api/user/${username}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for user: ${username}`);
        }
        const data = await response.json();
        console.log('Data fetched successfully:', data);

        const seenAt = new Date(data.seenAt);
        const now = new Date();
        const timeDiff = now - seenAt;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        const svg = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 500, height: 300, style: 'border-radius: 9px; background-color: #1e1e1e; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);' })
                .ele('style')
                    .txt(`
                        text {
                            font-family: 'Roboto Condensed', sans-serif;
                            fill: #f5f5f5;
                        }
                        .header {
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .subheader {
                            font-size: 18px;
                        }
                        .content {
                            font-size: 16px;
                        }
                        .border-box {
                            stroke: #4a4a4a;
                            stroke-width: 2;
                            fill: none;
                            rx: 9;
                            ry: 9;
                        }
                    `).up()
                .ele('rect', { width: '100%', height: '100%', fill: '#1e1e1e', rx: 9, ry: 9 }).up()
                .ele('rect', { x: 10, y: 10, width: 480, height: 280, class: 'border-box' }).up()
                .ele('text', { x: 20, y: 40, class: 'header' })
                    .txt(`User: ${data.username}`).up()
                .ele('text', { x: 20, y: 70, class: 'subheader' })
                    .txt(`Online: ${days} days, ${hours} h, and ${minutes} min ago`).up()
                .ele('text', { x: 20, y: 110, class: 'content' })
                    .txt(`Rapid: ${data.perfs.rapid.rating}`).up()
                .ele('text', { x: 20, y: 140, class: 'content' })
                    .txt(`Blitz: ${data.perfs.blitz.rating}`).up()
                .ele('text', { x: 20, y: 170, class: 'content' })
                    .txt(`Bullet: ${data.perfs.bullet.rating}`).up()
                .ele('text', { x: 20, y: 200, class: 'content' })
                    .txt(`Playtime: ${Math.floor(data.playTime.total / (60 * 60 * 1000))} hours`).up()
            .end({ prettyPrint: true });

        console.log('SVG generated successfully:', svg);

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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

        const profilePicUrl = data.profile?.icon ?? 'https://i.pinimg.com/originals/31/35/27/3135276a3e0c9e65472d3e544839c658.jpg';

        const svg = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 500, height: 300, style: 'border-radius: 9px; background-color: #363636; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);' })
                .ele('style')
                    .txt(`
                        text {
                            font-family: 'Roboto Condensed', sans-serif;
                            fill: #f5f5f5;
                        }
                        .profile-pic {
                            clip-path: circle(50%);
                        }
                    `).up()
                .ele('rect', { width: '100%', height: '100%', fill: '#0a0a0a', rx: 9, ry: 9 }).up()
                .ele('g', { transform: 'translate(20, 20)' })
                    .ele('image', { href: profilePicUrl, x: 0, y: 0, width: 100, height: 100, class: 'profile-pic' }).up()
                    .ele('text', { x: 120, y: 30, 'font-size': 24 })
                        .txt(data.username).up()
                    .ele('text', { x: 120, y: 60, 'font-size': 18 })
                        .txt(`Online: ${days} days, ${hours} h, and ${minutes} min ago`).up()
                .up()
                .ele('g', { transform: 'translate(20, 140)' })
                    .ele('text', { x: 0, y: 0, 'font-size': 18 })
                        .txt(`Rapid: ${data.perfs.rapid.rating}`).up()
                    .ele('text', { x: 0, y: 30, 'font-size': 18 })
                        .txt(`Blitz: ${data.perfs.blitz.rating}`).up()
                    .ele('text', { x: 0, y: 60, 'font-size': 18 })
                        .txt(`Bullet: ${data.perfs.bullet.rating}`).up()
                    .ele('text', { x: 0, y: 90, 'font-size': 18 })
                        .txt(`Playtime: ${Math.floor(data.playTime.total / (60 * 60 * 1000))} hours`).up()
                .up()
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

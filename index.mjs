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

        const profilePicUrl ='https://i.pinimg.com/originals/31/35/27/3135276a3e0c9e65472d3e544839c658.jpg'; // Use Lichess profile picture or a default one if not available

        const svg = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 500, height: 300 })
                .ele('style')
                    .txt(`
                        body {
                            font-family: 'Roboto Condensed', sans-serif;
                            background-color: #0a0a0a;
                            color: #f5f5f5;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .lichess {
                            border-radius: 9px;
                            height: auto;
                            width: 40%;
                            background-color: #363636;
                            color: #f5f5f5;
                            display: flex;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        .sidebar {
                            width: 50%;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            border-right: 1px solid #4a4a4a;
                        }
                        .sidebar img {
                            border-radius: 50%;
                            width: 100px;
                            height: 100px;
                            margin-bottom: 10px;
                        }
                        .sidebar h1 {
                            font-size: 22px;
                            margin: 10px 0;
                            color: #f5f5f5;
                        }
                        .sidebar p {
                            margin: 5px 0;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            color: #f5f5f5;
                        }
                        .ratings {
                            width: 50%;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .ratings h2 {
                            margin: 10px 0;
                            font-size: 18px;
                            color: #f5f5f5;
                        }
                        .icon {
                            margin-right: 8px;
                            color: #f5f5f5;
                        }
                        .profile-url a {
                            color: #f5f5f5;
                            text-decoration: none;
                        }
                        .profile-url a:hover {
                            text-decoration: underline;
                        }
                        .status-dot {
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            margin-right: 5px;
                        }
                    `).up()
                .ele('rect', { width: '100%', height: '100%', fill: '#0a0a0a' }).up()
                .ele('text', { x: 20, y: 40, fill: '#f5f5f5', 'font-size': 24 })
                    .txt(`User: ${data.username}`).up()
                .ele('text', { x: 20, y: 70, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Online: ${days} days, ${hours} h, and ${minutes} min ago`).up()
                .ele('image', { href: profilePicUrl, x: 20, y: 100, width: 100, height: 100 }).up()
                .ele('text', { x: 140, y: 130, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Rapid: ${data.perfs.rapid.rating}`).up()
                .ele('text', { x: 140, y: 160, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Blitz: ${data.perfs.blitz.rating}`).up()
                .ele('text', { x: 140, y: 190, fill: '#f5f5f5', 'font-size': 18 })
                    .txt(`Bullet: ${data.perfs.bullet.rating}`).up()
                .ele('text', { x: 140, y: 220, fill: '#f5f5f5', 'font-size': 18 })
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

// Carbon Theme JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const userInfoDiv = document.getElementById('user-info');

    fetch('https://lichess.org/api/user/Dzoomaster')
        .then(response => response.json())
        .then(data => {
            displayUserInfo(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            userInfoDiv.innerHTML = `<p>Error fetching data.</p>`;
        });

    function displayUserInfo(user) {
        const seenAt = new Date(user.seenAt);
        const now = new Date();
        const timeDiff = now - seenAt;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        const profilePicUrl = `https://i.pinimg.com/originals/31/35/27/3135276a3e0c9e65472d3e544839c658.jpg`; // Assumed placeholder for profile picture
        const isOnline = now - seenAt < 600000; // Assumes user is online if seen within the last 10 minutes

        userInfoDiv.innerHTML = `
            <div class="sidebar">
                <img src="${profilePicUrl}" alt="${user.username}">
                <h1>${user.username}</h1>
                <p>
                    <span class="status-dot" style="background-color: ${isOnline ? '#5D8E24' : '#4a4a4a'};"></span>
                    Online: ${days} days, ${hours} h, and ${minutes} min ago
                </p>
            </div>
            <div class="ratings">
                <h2><i class="fas fa-chess-knight icon"></i>Rapid: ${user.perfs.rapid.rating}</h2>
                <h2><i class="fas fa-bolt icon"></i>Blitz: ${user.perfs.blitz.rating}</h2>
                <h2><i class="fas fa-tachometer-alt icon"></i>Bullet: ${user.perfs.bullet.rating}</h2>
                <h2>Playtime: ${Math.floor(user.playTime.total / (60 * 60 * 1000))} hours</h2>
            </div>
        `;
    }
});

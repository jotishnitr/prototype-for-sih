const User = require('../models/User');
const Jurisdiction = require('../models/Jurisdiction');

const getWeather = async (req, res) => {
    try {
        const user_id = req.user?.id || req.body?.user_id;

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        let lat = 20.296059; // Default to Bhubaneswar
        let lon = 85.824540;
        let areaName = "Bhubaneswar";

        if (user.jurisdiction_id) {
            const jurisdiction = await Jurisdiction.findById(user.jurisdiction_id);
            if (jurisdiction) {
                areaName = jurisdiction.name || areaName;
                if (jurisdiction.bounds && 
                    typeof jurisdiction.bounds.north === 'number' && 
                    typeof jurisdiction.bounds.south === 'number' && 
                    typeof jurisdiction.bounds.east === 'number' && 
                    typeof jurisdiction.bounds.west === 'number') {
                    lat = (jurisdiction.bounds.north + jurisdiction.bounds.south) / 2;
                    lon = (jurisdiction.bounds.east + jurisdiction.bounds.west) / 2;
                }
            }
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "OpenWeather API key is not configured on server" });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenWeather API error response:", errText);
            return res.status(response.status).json({ message: "Failed to fetch weather from OpenWeather" });
        }

        const weatherData = await response.json();
        
        const windSpeedKmh = Math.round((weatherData.wind?.speed || 0) * 3.6);
        const weatherMain = weatherData.weather?.[0]?.main || 'Clear';
        const weatherDesc = weatherData.weather?.[0]?.description || 'clear sky';
        const id = weatherData.weather?.[0]?.id || 800;

        // Map severity
        let severity = "NORMAL";
        if (id >= 200 && id < 300) severity = "RED ALERT"; // Thunderstorm
        else if (id >= 500 && id < 600) severity = "ORANGE ALERT"; // Rain
        else if (windSpeedKmh > 50) severity = "RED ALERT";
        else if (id >= 300 && id < 500) severity = "YELLOW ALERT"; // Drizzle
        else if (id >= 600 && id < 700) severity = "ORANGE ALERT"; // Snow

        // Map title
        let title = `${weatherMain.toUpperCase()} - ${weatherDesc.toUpperCase()}`;
        if (id >= 200 && id < 300) title = "THUNDERSTORM WARNING";
        else if (id >= 500 && id < 600) title = "RAIN WARNING";

        // Map rainfall description
        let rainfall = "None";
        if (weatherData.rain?.['1h']) {
            const mm = weatherData.rain['1h'];
            if (mm > 10) rainfall = `Heavy (${mm} mm/h)`;
            else if (mm > 2.5) rainfall = `Moderate (${mm} mm/h)`;
            else rainfall = `Light (${mm} mm/h)`;
        } else if (weatherData.rain?.['3h']) {
            const mm = weatherData.rain['3h'];
            if (mm > 30) rainfall = `Heavy (${mm} mm/3h)`;
            else if (mm > 7.5) rainfall = `Moderate (${mm} mm/3h)`;
            else rainfall = `Light (${mm} mm/3h)`;
        } else if (id >= 200 && id < 300) {
            rainfall = "Heavy";
        } else if (id >= 500 && id < 600) {
            rainfall = "Moderate";
        } else if (id >= 300 && id < 500) {
            rainfall = "Light";
        }

        const weatherAlert = {
            title,
            area: areaName,
            severity,
            wind: `${windSpeedKmh} km/h`,
            rainfall,
            isMock: false
        };

        return res.status(200).json({ weatherAlert });
    } catch (err) {
        console.error("getWeather controller error:", err);
        return res.status(500).json({ message: "Server error in weather fetcher" });
    }
};

module.exports = getWeather;

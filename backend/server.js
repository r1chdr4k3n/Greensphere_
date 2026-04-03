const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const axios = require("axios");


const app = express();   // ✅ FIRST

app.use(cors());
app.use(express.json());

// ✅ NOW you can add this
app.use((req, res, next) => {
    console.log("HIT:", req.method, req.url);
    next();
});

// DB CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "greensphere"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected");
});

// ================= AI ANALYZE =================
app.post("/analyze", async (req, res) => {
    console.log("ANALYZE HIT");

    const { eventType, people, food, location, email } = req.body;

    const API_KEY = "AIzaSyAxwZbOTtxSJ00lvR5rZ9OJ41C9g6EZaec";

    let carbon = people * (
        food.includes("Low") ? 2 :
        food.includes("Mixed") ? 4 : 6
    );

    try {
       const aiResponse = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
        contents: [{
            parts: [{
                text: `Give 4 short eco-friendly suggestions for a ${eventType} event in ${location} with ${people} people. Keep it simple and numbered.`
            }]
        }]
    }
);

        let suggestions =
            aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "No suggestions generated";

        db.query(
            "INSERT INTO searches (email, event, people, location, carbon) VALUES (?, ?, ?, ?, ?)",
            [email, eventType, people, location, carbon]
        );

        res.json({ carbon, suggestions });

    } catch (err) {
        console.log("AI ERROR:", err.response?.data || err.message);

        res.json({
            carbon,
            suggestions: "AI unavailable"
        });
    }
});
// ================= BOOKING =================
app.post("/booking", (req, res) => {
    console.log("BOOKING HIT");

    const { email, event, tickets } = req.body;

    db.query(
        "INSERT INTO bookings (email, event, tickets) VALUES (?, ?, ?)",
        [email, event, tickets],
        (err) => {
            if (err) return res.json({ message: "Booking failed" });
            res.json({ message: "Booking successful" });
        }
    );
});

// ================= SCHEDULE =================
app.post("/schedule", (req, res) => {
    console.log("SCHEDULE HIT");

    const { email, task, date } = req.body;

    db.query(
        "INSERT INTO schedule (email, task, date) VALUES (?, ?, ?)",
        [email, task, date],
        (err) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Schedule failed" });
            }
            res.json({ message: "Task added" });
        }
    );
});

// ================= FEEDBACK =================
app.post("/feedback", (req, res) => {
    console.log("FEEDBACK HIT");

    const { email, message } = req.body;

    db.query(
        "INSERT INTO feedback (email, message) VALUES (?, ?)",
        [email, message],
        (err) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Feedback failed" });
            }

            res.json({ message: "Feedback submitted" });
        }
    );
});

// START SERVER
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
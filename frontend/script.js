function enterApp() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;

    if (!name || !email) {
        alert("Enter details");
        return;
    }

    localStorage.setItem("name", name);
    localStorage.setItem("email", email);

    window.location.href = "dashboard.html";
}

window.onload = function () {
    let name = localStorage.getItem("name");
    if (name) {
        let el = document.getElementById("welcome");
        if (el) el.innerText = "Welcome, " + name;
    }
};
// NAVIGATION
function go(page) {
    window.location.href = page;
}

// ================= AI ANALYZE =================
async function analyzeEvent() {
    try {
        let eventType = document.getElementById("eventType").value;
        let people = document.getElementById("people").value;
        let food = document.getElementById("food").value;
        let location = document.getElementById("city").value + ", " +
                       document.getElementById("state").value;

        let carbon = people * (
            food.includes("Low") ? 2 :
            food.includes("Mixed") ? 4 : 6
        );

        document.getElementById("loading").style.display = "block";

        let res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDJAuc29Sxiuz0JEj7IEzmGHzb0MM4gaO4",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Give 4 short eco suggestions for a ${eventType} event in ${location} with ${people} people. Return as numbered points.`
                        }]
                    }]
                })
            }
        );

        let data = await res.json();
        console.log("FULL RESPONSE:", data);

        let suggestions = "No suggestions";

        if (data.candidates && data.candidates.length > 0) {
            let parts = data.candidates[0].content.parts;

            if (parts && parts.length > 0) {
                suggestions = parts.map(p => p.text).join(" ");
            }
        }

        document.getElementById("loading").style.display = "none";

        let score = Math.max(0, 100 - (carbon / 100));

        document.getElementById("result").innerHTML = `
            <div class="card">
                <h3>Carbon: ${carbon}</h3>
                <h3>Score: ${score.toFixed(1)}</h3>
                <p>${suggestions.replace(/\n/g, "<br>")}</p>
            </div>
        `;

    } catch (err) {
        console.log(err);
        alert("AI failed");
    }
}
// ================= BOOKING =================
async function bookEvent() {
    try {
        let event = document.getElementById("bookEvent").value;
        let tickets = document.getElementById("tickets").value;
        let email = localStorage.getItem("email") || "test@mail.com";

        let res = await fetch("https://greensphere-api.onrender.com/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, event, tickets })
        });

        let data = await res.json();

        document.getElementById("bookMsg").innerText = data.message;
    } catch (err) {
        console.log(err);
        alert("Booking failed");
    }
}

// ================= SCHEDULE =================
async function addSchedule() {
    try {
        let task = document.getElementById("task").value;
        let date = document.getElementById("date").value;
        let email = localStorage.getItem("email") || "test@mail.com";

        let res = await fetch("https://greensphere-api.onrender.com/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, task, date })
        });

        let data = await res.json();

        alert(data.message);
    } catch (err) {
        console.log(err);
        alert("Schedule failed");
    }
}

// ================= FEEDBACK =================
async function submitFeedback() {
    try {
        let message = document.getElementById("feedback").value;
        let email = localStorage.getItem("email") || "test@mail.com";

        let res = await fetch("https://greensphere-api.onrender.com/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, message })
        });

        let data = await res.json();

        document.getElementById("feedbackMsg").innerText = data.message;
    } catch (err) {
        console.log(err);
        alert("Feedback failed");
    }
}

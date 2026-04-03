const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "greensphere"
});

db.connect(err => {
    if (err) {
        console.log("DB ERROR:", err);
        return;
    }
    console.log("MySQL Connected");
});

module.exports = db;
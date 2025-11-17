const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 10000;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/terms.html");
});

let waitingUser = null;

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    if (!waitingUser) {
        waitingUser = socket;
        console.log("User waiting:", socket.id);
        return;
    }

    const partner = waitingUser;
    waitingUser = null;
    console.log("Matched:", socket.id, "<->", partner.id);

    socket.emit("matched");
    partner.emit("matched");

    socket.on("signal", (data) => {
        partner.emit("signal", data);
    });
    partner.on("signal", (data) => {
        socket.emit("signal", data);
    });

    socket.on("disconnect", () => {
        partner.emit("partnerDisconnected");
        console.log("Disconnected:", socket.id);
    });
    partner.on("disconnect", () => {
        socket.emit("partnerDisconnected");
        console.log("Disconnected:", partner.id);
    });
});

http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});


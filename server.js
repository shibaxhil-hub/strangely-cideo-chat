const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/terms.html");
});

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("signal", (data) => {
        socket.broadcast.emit("signal", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        socket.broadcast.emit("partnerDisconnected");
    });
});

http.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

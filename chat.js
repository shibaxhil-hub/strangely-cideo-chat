alert("chat.js is running");

const socket = io();
let peer;
let localStream;

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: true
        });
    } catch (err) {
        console.log("No camera found, using empty stream");
        localStream = new MediaStream();
    }

    document.getElementById("localVideo").srcObject = localStream;
}

startCamera();

socket.on("matched", () => {
    startPeer(true);
});

socket.on("signal", data => {
    peer.signal(data);
});

socket.on("partnerDisconnected", () => {
    if (peer) peer.destroy();
    alert("Partner disconnected");
});

function startPeer(isInitiator) {
    peer = new SimplePeer({
        initiator: isInitiator,
        stream: localStream,
        trickle: false
    });

    peer.on("signal", data => {
        socket.emit("signal", data);
    });

    peer.on("stream", stream => {
        document.getElementById("remoteVideo").srcObject = stream;
    });
}

document.getElementById("nextBtn").onclick = () => {
    window.location.reload();
};

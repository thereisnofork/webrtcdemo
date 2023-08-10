// import { useEffect } from "react";
import "./App.css";
import { useState } from "react";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

pc.onconnectionstatechange = (e) => {
  console.log("🚀 onconnectionstatechange:", e);
  console.log(
    "🚀--------->  pc.iceConnectionState: ------>",
    pc.iceConnectionState
  );
};

function App() {
  const [textareaValue, setTextareaValue] = useState("");
  const [offerToken, setOfferToken] = useState("");
  const [status, setStatus] = useState("");

  const onHostClicked = () => {
    setStatus("host");
    const dc = pc.createDataChannel("channel");
    console.log("🚀  onHostClicked  dc:", dc);

    dc.onopen = (e) => {
      console.log("🚀 onopen:");
    };

    dc.onmessage = (e) => {
      console.log("🚀 // e.data:", e.data);
    };

    pc.onicecandidate = (e) => {
      console.log("🚀  onicecandidate  e:", e);
      setOfferToken(JSON.stringify(pc.localDescription));
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => console.log("set ofert to setLocalDescription"))
      .catch((err) => console.log(err));
  };

  /////

  const onClientClicked = () => {
    setStatus("client");

    pc.onicecandidate = (e) => {
      console.log("🚀  onicecandidate.  e:", e);
      setOfferToken(JSON.stringify(pc.localDescription));
    };

    pc.ondatachannel = (e) => {
      console.log("🚀 .ondatachannel  e:", e);

      e.channel.onmessage = (e) => {
        console.log("🚀 .e.channel  e:", e.data);
      };

      e.channel.onopen = (e) => {
        console.log("🚀 .onopen e:");
      };
    };
  };

  /////

  const onTextareaSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const recivedToken = JSON.parse(e.target.value);

      pc.setRemoteDescription(recivedToken)
        .then((e) => {
          console.log("🚀 setRemoteDescription ");
        })
        .catch((err) => console.log(err));

      if (status === "client") {
        pc.createAnswer()
          .then((answer) => {
            console.log("🚀 .then answer:", answer);
            setOfferToken(JSON.stringify(answer));

            return pc.setLocalDescription(answer);
          })
          .catch((err) => console.log(err));
      }
    }
  };

  const onTextareChanges = (e) => {
    setTextareaValue(e.target.value);
  };

  return (
    <div className="App">
      <div>{status}</div>

      {!status && (
        <>
          <button onClick={onHostClicked} type="button">
            im host
          </button>
          <button onClick={onClientClicked} type="button">
            im client
          </button>
        </>
      )}

      <form>
        <textarea
          value={textareaValue}
          className=""
          onChange={onTextareChanges}
          onKeyDown={onTextareaSubmit}
          style={{ height: 300, width: 300, margin: 20 }}
        />
      </form>

      <div style={{ height: 300, width: 300, margin: 20 }}>{offerToken}</div>
    </div>
  );
}

export default App;

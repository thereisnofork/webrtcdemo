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

const lc = new RTCPeerConnection(servers);

function App() {
  const [textareaValue, setTextareaValue] = useState("");
  const [offerToken, setOfferToken] = useState("");
  const [status, setStatus] = useState("");

  const onHostClicked = () => {
    setStatus("host");
    const dc = lc.createDataChannel("channel");

    dc.onopen = (e) => {
      console.log("🚀 onopen:");
    };

    dc.onmessage = (e) => {
      console.log("🚀 // e.data:", e.data);
    };

    lc.onicecandidate = (e) => {
      console.log("🚀  onicecandidate  e:", e);
      setOfferToken(JSON.stringify(lc.localDescription));
    };

    lc.createOffer()
      .then((offer) => lc.setLocalDescription(offer))
      .then(() => console.log("set successfully"))
      .catch((err) => console.log(err));
  };

  /////

  const onClientClicked = () => {
    setStatus("client");

    lc.onicecandidate = (e) => {
      console.log("🚀  onicecandidate.  e:", e);
      setOfferToken(JSON.stringify(lc.localDescription));
    };

    lc.ondatachannel = (e) => {
      console.log("🚀 .ondatachannel  e:", e);
      lc.dc = e.channel;

      e.channel.onmessage = (e) => {
        console.log("🚀 .e.channel  e:", e.data);
      };

      e.channel.onopen = (e) => {
        console.log("🚀 .onopen e:", e);
      };
    };
  };

  /////

  const onTextareaSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (status === "host") {
        const recivedAnswer = JSON.parse(e.target.value);

        lc.setRemoteDescription(recivedAnswer)
          .then((e) => {
            console.log("🚀  .then  e:", e);
          })
          .catch((err) => console.log(err));
      } else {
        const recivedOffer = JSON.parse(e.target.value);

        lc.setRemoteDescription(recivedOffer)
          .then(() => {
            console.log("🚀  .then recivedOffer set e:");
          })
          .catch((err) => console.log(err));

        lc.createAnswer()
          .then((answer) => {
            console.log("🚀  .then  answer:", answer);
            setOfferToken(JSON.stringify(answer));

            return lc.setLocalDescription(answer);
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

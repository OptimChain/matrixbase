import { useState, useCallback, useRef } from "react";
import "./App.css";

const WORDS = [
  "apple", "brave", "cloud", "dance", "eagle", "flame", "grace", "house",
  "ivory", "joker", "knife", "lemon", "mango", "night", "ocean", "piano",
  "queen", "river", "stone", "tiger", "unity", "valor", "whale", "xenon",
  "youth", "zebra", "amber", "bloom", "chain", "drift", "ember", "frost",
  "gleam", "haven", "inlet", "jewel", "knack", "lunar", "marsh", "noble",
  "oasis", "pearl", "quest", "reign", "surge", "thorn", "urban", "vivid",
  "wrath", "yield", "azure", "blaze", "coral", "delta", "epoch", "forge",
  "ghost", "haste", "irony", "jolly", "karma", "lyric", "medal", "nexus",
  "orbit", "prism", "quilt", "rusty", "solar", "truce", "ultra", "vigor",
  "weave", "pixel", "abyss", "birch", "cider", "dwarf", "elbow", "fable",
  "glyph", "hunch", "ivory", "jumbo", "kayak", "llama", "moose", "nerve",
  "olive", "plume", "quirk", "rogue", "spice", "tulip", "umbra", "vault",
  "waltz", "xerox", "yacht", "zonal", "alpha", "bravo", "chaos", "demon",
  "exile", "flint", "grain", "hover", "index", "jelly", "kneel", "lodge",
  "maple", "nomad", "optic", "paste", "query", "realm", "scout", "trace",
  "unify", "venom", "wield", "xylem", "yeast", "zilch", "arrow", "bench",
];

const DEFAULT_ACTION_URL =
  "https://candy.ai/ai-girlfriend/olivia-carter/live-actions/olivia-carter/messages";

function generateWords() {
  const result = [];
  for (let i = 0; i < 16; i++) {
    const idx = Math.floor(Math.random() * WORDS.length);
    result.push(WORDS[idx]);
  }
  return result.join(" ");
}

function App() {
  const [words, setWords] = useState(generateWords);
  const [authToken, setAuthToken] = useState("");
  const [actionUrl, setActionUrl] = useState(DEFAULT_ACTION_URL);
  const [status, setStatus] = useState("");
  const formRef = useRef(null);

  const handleGenerate = useCallback(() => {
    setWords(generateWords());
    setStatus("");
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(words);
    setStatus("Copied!");
    setTimeout(() => setStatus(""), 2000);
  }, [words]);

  const handleSubmit = useCallback(() => {
    if (!authToken.trim()) {
      setStatus("Please enter the authenticity token first.");
      return;
    }
    if (formRef.current) {
      formRef.current.submit();
      setStatus("Submitted!");
    }
  }, [authToken]);

  const handleGenerateAndSubmit = useCallback(() => {
    const newWords = generateWords();
    setWords(newWords);
    if (!authToken.trim()) {
      setStatus("Please enter the authenticity token first.");
      return;
    }
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit();
        setStatus("Generated & Submitted!");
      }
    }, 100);
  }, [authToken]);

  return (
    <div className="App">
      <div className="container">
        <h1>Random Word Generator</h1>
        <p className="subtitle">Generate a random string of 16 words</p>
        <div className="word-box">{words}</div>
        <div className="buttons">
          <button className="btn generate" onClick={handleGenerate}>
            Generate
          </button>
          <button className="btn copy" onClick={handleCopy}>
            Copy
          </button>
        </div>

        <div className="submit-section">
          <h2>Submit to Chat</h2>
          <div className="input-group">
            <label htmlFor="action-url">Action URL</label>
            <input
              id="action-url"
              type="text"
              className="text-input"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="Form action URL"
            />
          </div>
          <div className="input-group">
            <label htmlFor="auth-token">Authenticity Token</label>
            <input
              id="auth-token"
              type="text"
              className="text-input"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Paste authenticity_token from page source"
            />
          </div>

          {/* Hidden form that performs the actual POST submission */}
          <form
            ref={formRef}
            method="post"
            action={actionUrl}
            acceptCharset="UTF-8"
            target="_blank"
            style={{ display: "none" }}
          >
            <input
              type="hidden"
              name="authenticity_token"
              value={authToken}
            />
            <textarea
              name="message_body"
              readOnly
              value={words}
              placeholder="Ask Anything"
              rows={1}
            />
          </form>

          <div className="buttons">
            <button className="btn submit" onClick={handleSubmit}>
              Submit Words
            </button>
            <button className="btn submit-auto" onClick={handleGenerateAndSubmit}>
              Generate &amp; Submit
            </button>
          </div>

          {status && <p className="status-message">{status}</p>}

          <details className="help-section">
            <summary>How to get the authenticity token</summary>
            <ol>
              <li>Open the target chat page in your browser</li>
              <li>Right-click the chat input area and choose "Inspect"</li>
              <li>
                Find the <code>&lt;form&gt;</code> containing the{" "}
                <code>&lt;textarea name="message_body"&gt;</code>
              </li>
              <li>
                Copy the <code>value</code> of the{" "}
                <code>&lt;input type="hidden" name="authenticity_token"&gt;</code>
              </li>
              <li>Paste it into the "Authenticity Token" field above</li>
            </ol>
          </details>
        </div>
      </div>
    </div>
  );
}

export default App;

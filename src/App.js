import { useState, useCallback } from "react";
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

function generateWords() {
  const result = [];
  for (let i = 0; i < 16; i++) {
    const idx = Math.floor(Math.random() * WORDS.length);
    result.push(WORDS[idx]);
  }
  return result.join(" ");
}

// Bookmarklet code that runs on the target page (single run)
const createBookmarkletCode = (loopEnabled, intervalMs) => `(function(){
  const WORDS=${JSON.stringify(WORDS)};
  const gen=()=>{let r=[];for(let i=0;i<16;i++){r.push(WORDS[Math.floor(Math.random()*WORDS.length)])}return r.join(' ')};
  const submit=()=>{
    const ta=document.querySelector('textarea[name="message_body"]');
    if(!ta){console.error('Textarea not found');return false}
    const words=gen();
    ta.value=words;
    ta.dispatchEvent(new Event('input',{bubbles:true}));
    const btn=document.querySelector('button[data-action*="handleSend"]')||document.querySelector('button[type="submit"]');
    if(btn){setTimeout(()=>btn.click(),100)}
    console.log('Submitted:',words);
    return true;
  };
  ${loopEnabled ? `
  if(window._wordLoop){clearInterval(window._wordLoop);console.log('Stopped previous loop')}
  submit();
  window._wordLoop=setInterval(submit,${intervalMs});
  window._wordLoopCount=1;
  console.log('Loop started: submitting every ${intervalMs/1000}s. Run window._stopWordLoop() to stop.');
  window._stopWordLoop=()=>{clearInterval(window._wordLoop);window._wordLoop=null;console.log('Loop stopped after',window._wordLoopCount,'submissions')};
  ` : `submit();`}
})();`;

// Stop loop bookmarklet
const STOP_LOOP_CODE = `(function(){
  if(window._wordLoop){
    clearInterval(window._wordLoop);
    window._wordLoop=null;
    console.log('Loop stopped');
    alert('Loop stopped!');
  }else{
    alert('No loop running');
  }
})();`;

function App() {
  const [words, setWords] = useState(generateWords);
  const [status, setStatus] = useState("");
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(30);

  const handleGenerate = useCallback(() => {
    setWords(generateWords());
    setStatus("");
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(words);
    setStatus("Copied!");
    setTimeout(() => setStatus(""), 2000);
  }, [words]);

  const getBookmarkletCode = useCallback(() => {
    let code = createBookmarkletCode(loopEnabled, intervalSeconds * 1000);
    if (!autoSubmit) {
      code = code.replace(
        "if(btn){setTimeout(()=>btn.click(),100)}",
        "/* auto-submit disabled */"
      );
    }
    return code;
  }, [autoSubmit, loopEnabled, intervalSeconds]);

  const handleCopyBookmarklet = useCallback(() => {
    const bookmarklet = `javascript:${encodeURIComponent(getBookmarkletCode())}`;
    navigator.clipboard.writeText(bookmarklet);
    setStatus("Bookmarklet copied! Create a new bookmark and paste as URL.");
    setTimeout(() => setStatus(""), 4000);
  }, [getBookmarkletCode]);

  const handleCopyConsoleScript = useCallback(() => {
    navigator.clipboard.writeText(getBookmarkletCode());
    setStatus("Console script copied! Paste in browser DevTools console.");
    setTimeout(() => setStatus(""), 4000);
  }, [getBookmarkletCode]);

  const handleCopyStopScript = useCallback(() => {
    const bookmarklet = `javascript:${encodeURIComponent(STOP_LOOP_CODE)}`;
    navigator.clipboard.writeText(bookmarklet);
    setStatus("Stop bookmarklet copied!");
    setTimeout(() => setStatus(""), 3000);
  }, []);

  const bookmarkletHref = `javascript:${encodeURIComponent(getBookmarkletCode())}`;
  const stopBookmarkletHref = `javascript:${encodeURIComponent(STOP_LOOP_CODE)}`;

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
          <h2>Submit to Chat (Bookmarklet)</h2>
          <p className="section-desc">
            Use this bookmarklet on the chat page. It generates 16 random words,
            injects them into the textarea, and optionally auto-submits.
          </p>

          <div className="option-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
              />
              Auto-submit after injection
            </label>
          </div>

          <div className="option-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={loopEnabled}
                onChange={(e) => setLoopEnabled(e.target.checked)}
              />
              Loop mode (repeat automatically)
            </label>
          </div>

          {loopEnabled && (
            <div className="option-row interval-row">
              <label htmlFor="interval-input" className="interval-label">
                Interval (seconds):
              </label>
              <input
                id="interval-input"
                type="number"
                min="5"
                max="300"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Math.max(5, parseInt(e.target.value) || 30))}
                className="interval-input"
              />
            </div>
          )}

          <div className="bookmarklet-box">
            <p className="drag-instruction">
              Drag this link to your bookmarks bar:
            </p>
            <div className="bookmarklet-links">
              <a
                className="bookmarklet-link"
                href={bookmarkletHref}
                onClick={(e) => e.preventDefault()}
              >
                {loopEnabled ? "🔄 Loop 16 Words" : "📝 Send 16 Words"}
              </a>
              {loopEnabled && (
                <a
                  className="bookmarklet-link stop-link"
                  href={stopBookmarkletHref}
                  onClick={(e) => e.preventDefault()}
                >
                  ⏹️ Stop Loop
                </a>
              )}
            </div>
          </div>

          <div className="buttons">
            <button className="btn submit" onClick={handleCopyBookmarklet}>
              Copy Bookmarklet
            </button>
            <button className="btn submit-auto" onClick={handleCopyConsoleScript}>
              Copy Console Script
            </button>
            {loopEnabled && (
              <button className="btn stop" onClick={handleCopyStopScript}>
                Copy Stop Script
              </button>
            )}
          </div>

          {status && <p className="status-message">{status}</p>}

          <details className="help-section">
            <summary>How to use</summary>
            <ol>
              <li>
                <strong>Bookmarklet:</strong> Drag the link above to your
                bookmarks bar, or copy and create a bookmark manually
              </li>
              <li>Go to the chat page and log in</li>
              <li>Click the bookmarklet to generate &amp; submit 16 words</li>
              {loopEnabled && (
                <li>
                  <strong>Loop mode:</strong> It will keep submitting every{" "}
                  {intervalSeconds} seconds. Click the Stop bookmarklet or run{" "}
                  <code>window._stopWordLoop()</code> in the console to stop.
                </li>
              )}
            </ol>
            <p style={{ marginTop: "1rem" }}>
              <strong>Alternative:</strong> Copy the console script, open
              DevTools (F12) on the chat page, paste into Console, and press
              Enter.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

export default App;

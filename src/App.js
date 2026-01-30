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

function App() {
  const [words, setWords] = useState(generateWords);

  const handleGenerate = useCallback(() => {
    setWords(generateWords());
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(words);
  }, [words]);

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
      </div>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import { Sparkles, Cpu, Palette, Zap, Download } from "lucide-react";

const QuantumArtGenerator = () => {
  const [style, setStyle] = useState("chaotic");
  const [colorScheme, setColorScheme] = useState("vibrant");
  const [complexity, setComplexity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [artData, setArtData] = useState(null);

  const styles = {
    chaotic: {
      name: "Chaotic",
      description: "Particle explosion",
      gates: ["h", "rx", "ry"],
    },
    structured: {
      name: "Structured",
      description: "Geometric patterns",
      gates: ["cx", "cz", "swap"],
    },
    flowing: {
      name: "Flowing",
      description: "Wave patterns",
      gates: ["rx", "ry", "rz", "p"],
    },
    minimal: {
      name: "Minimal",
      description: "Clean shapes",
      gates: ["x", "h", "cx"],
    },
  };

  const colorSchemes = {
    vibrant: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"],
    cosmic: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"],
    nature: ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#B7E4C7"],
    fire: ["#370617", "#6A040F", "#9D0208", "#D00000", "#DC2F02"],
  };

  const generateQuantumCircuit = () => {
    const numQubits = Math.min(complexity, 5);
    const selectedGates = styles[style].gates;
    const circuit = { qubits: numQubits, gates: [] };
    for (let i = 0; i < numQubits * 3; i++) {
      const gate =
        selectedGates[Math.floor(Math.random() * selectedGates.length)];
      const qubit = Math.floor(Math.random() * numQubits);
      if (gate === "cx" || gate === "cz" || gate === "swap") {
        circuit.gates.push({
          type: gate,
          control: qubit,
          target: (qubit + 1) % numQubits,
        });
      } else if (gate.startsWith("r") || gate === "p") {
        circuit.gates.push({
          type: gate,
          qubit: qubit,
          angle: Math.random() * Math.PI * 2,
        });
      } else {
        circuit.gates.push({ type: gate, qubit: qubit });
      }
    }
    return circuit;
  };

  const simulateQuantumCircuit = (circuit) => {
    const numQubits = circuit.qubits;
    const dim = Math.pow(2, numQubits);
    let stateReal = new Array(dim).fill(0);
    let stateImag = new Array(dim).fill(0);
    stateReal[0] = 1;

    const applyGate = (gateMatrix, targetQubit) => {
      const newReal = new Array(dim).fill(0);
      const newImag = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        const bit = (i >> targetQubit) & 1;
        const partnerIdx = i ^ (1 << targetQubit);
        for (let j = 0; j < 2; j++) {
          const idx = j === bit ? i : partnerIdx;
          const matrixElem = gateMatrix[bit][j];
          newReal[i] +=
            matrixElem.real * stateReal[idx] - matrixElem.imag * stateImag[idx];
          newImag[i] +=
            matrixElem.real * stateImag[idx] + matrixElem.imag * stateReal[idx];
        }
      }
      stateReal = newReal;
      stateImag = newImag;
    };

    const applyCNOT = (control, target) => {
      const newReal = [...stateReal];
      const newImag = [...stateImag];
      for (let i = 0; i < dim; i++) {
        if (((i >> control) & 1) === 1) {
          const flippedIdx = i ^ (1 << target);
          newReal[i] = stateReal[flippedIdx];
          newImag[i] = stateImag[flippedIdx];
        }
      }
      stateReal = newReal;
      stateImag = newImag;
    };

    const gates = {
      h: [
        [
          { real: 0.707, imag: 0 },
          { real: 0.707, imag: 0 },
        ],
        [
          { real: 0.707, imag: 0 },
          { real: -0.707, imag: 0 },
        ],
      ],
      x: [
        [
          { real: 0, imag: 0 },
          { real: 1, imag: 0 },
        ],
        [
          { real: 1, imag: 0 },
          { real: 0, imag: 0 },
        ],
      ],
    };

    const rotationGate = (angle, axis) => {
      const half = angle / 2;
      if (axis === "x") {
        return [
          [
            { real: Math.cos(half), imag: 0 },
            { real: 0, imag: -Math.sin(half) },
          ],
          [
            { real: 0, imag: -Math.sin(half) },
            { real: Math.cos(half), imag: 0 },
          ],
        ];
      } else {
        return [
          [
            { real: Math.cos(half), imag: 0 },
            { real: -Math.sin(half), imag: 0 },
          ],
          [
            { real: Math.sin(half), imag: 0 },
            { real: Math.cos(half), imag: 0 },
          ],
        ];
      }
    };

    circuit.gates.forEach((gate) => {
      if (gate.type === "h") applyGate(gates.h, gate.qubit);
      else if (gate.type === "x") applyGate(gates.x, gate.qubit);
      else if (gate.type === "cx") applyCNOT(gate.control, gate.target);
      else if (gate.type === "rx")
        applyGate(rotationGate(gate.angle, "x"), gate.qubit);
      else if (gate.type === "ry")
        applyGate(rotationGate(gate.angle, "y"), gate.qubit);
    });

    const probabilities = stateReal.map(
      (r, i) => r * r + stateImag[i] * stateImag[i]
    );
    const counts = {};
    for (let shot = 0; shot < 1024; shot++) {
      let rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < dim; i++) {
        cumulative += probabilities[i];
        if (rand <= cumulative) {
          const bitstring = i.toString(2).padStart(numQubits, "0");
          counts[bitstring] = (counts[bitstring] || 0) + 1;
          break;
        }
      }
    }
    return counts;
  };

  const generateArtFromResults = (counts, circuit) => {
    const canvas = document.createElement("canvas");
    const size = 1200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const totalShots = Object.values(counts).reduce((a, b) => a + b, 0);
    const quantumSeed = Object.keys(counts).reduce(
      (sum, bits) => sum + parseInt(bits, 2),
      0
    );
    const measurementHash = quantumSeed % 10000;

    const bgGradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size
    );
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(1, "#0a0a0f");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);

    const colors = colorSchemes[colorScheme];
    const results = Object.entries(counts).map(([bitstring, count]) => ({
      bits: bitstring.split(""),
      probability: count / totalShots,
      count: count,
      value: parseInt(bitstring, 2),
    }));
    results.sort((a, b) => b.probability - a.probability);

    const rotationOffset = ((quantumSeed % 360) * Math.PI) / 180;
    const scaleVariation = 0.7 + (measurementHash % 100) / 100;

    if (style === "chaotic") {
      results.forEach((result) => {
        const numParticles = Math.ceil(result.probability * 100);
        for (let i = 0; i < numParticles; i++) {
          const angle =
            ((result.value + i * 137.5 + (rotationOffset * 180) / Math.PI) *
              Math.PI) /
            180;
          const distance =
            (result.probability * 0.3 + Math.random() * 0.4) *
            size *
            scaleVariation;
          const x = size / 2 + Math.cos(angle) * distance;
          const y = size / 2 + Math.sin(angle) * distance;
          const colorIdx = (result.value + i) % colors.length;
          const radius =
            (result.probability * 30 + 8) * (0.5 + Math.random() * 0.5);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
          glow.addColorStop(0, colors[colorIdx] + "EE");
          glow.addColorStop(0.5, colors[(colorIdx + 1) % colors.length] + "88");
          glow.addColorStop(1, colors[(colorIdx + 2) % colors.length] + "00");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = colors[colorIdx] + "FF";
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (style === "structured") {
      const numLayers = Math.min(results.length, 12);
      results.slice(0, numLayers).forEach((result, layerIdx) => {
        const radius =
          (size * 0.08 + layerIdx * (size * 0.05)) * scaleVariation;
        const sides = 3 + (result.value % 8);
        const rotation = (result.value * 17 * Math.PI) / 180 + rotationOffset;
        ctx.strokeStyle = colors[layerIdx % colors.length] + "AA";
        ctx.lineWidth = result.probability * 8 + 2;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = rotation + (i / sides) * Math.PI * 2;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          radius * 0.5,
          size / 2,
          size / 2,
          radius
        );
        gradient.addColorStop(0, colors[layerIdx % colors.length] + "33");
        gradient.addColorStop(1, colors[(layerIdx + 1) % colors.length] + "00");
        ctx.fillStyle = gradient;
        ctx.fill();
        for (let i = 0; i < sides; i++) {
          const angle = rotation + (i / sides) * Math.PI * 2;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;
          ctx.fillStyle = colors[(layerIdx + i) % colors.length] + "FF";
          ctx.beginPath();
          ctx.arc(x, y, result.probability * 15 + 5, 0, Math.PI * 2);
          ctx.fill();
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 20);
          glow.addColorStop(0, colors[(layerIdx + i) % colors.length] + "AA");
          glow.addColorStop(1, colors[(layerIdx + i) % colors.length] + "00");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (style === "flowing") {
      const numWaves = Math.min(results.length, 20);
      results.slice(0, numWaves).forEach((result, idx) => {
        const colorIdx = idx % colors.length;
        const phase = (result.value / 255) * Math.PI * 2;
        const amplitude = result.probability * size * 0.3;
        const frequency = 0.01 + result.probability * 0.02;
        ctx.strokeStyle = colors[colorIdx] + "88";
        ctx.lineWidth = result.probability * 12 + 3;
        ctx.beginPath();
        for (let x = 0; x < size; x += 3) {
          const y =
            size / 2 +
            Math.sin(x * frequency + phase) * amplitude +
            Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = colors[(colorIdx + 1) % colors.length] + "44";
        ctx.lineWidth = result.probability * 20 + 5;
        ctx.stroke();
      });
      results.forEach((result, idx) => {
        const numParticles = Math.ceil(result.probability * 30);
        for (let i = 0; i < numParticles; i++) {
          const x = (result.value * 17 + i * 137.5) % size;
          const phase = (result.value / 255) * Math.PI * 2;
          const frequency = 0.01 + result.probability * 0.02;
          const amplitude = result.probability * size * 0.3;
          const y = size / 2 + Math.sin(x * frequency + phase) * amplitude;
          const colorIdx = (idx + i) % colors.length;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
          glow.addColorStop(0, colors[colorIdx] + "FF");
          glow.addColorStop(1, colors[colorIdx] + "00");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (style === "minimal") {
      const topResults = results.slice(0, 5);
      topResults.forEach((result, idx) => {
        const baseSize = size * 0.15;
        const shapeSize = baseSize * (1 + result.probability * 2);
        const offsetAngle = (idx / topResults.length) * Math.PI * 2;
        const offsetDist = size * 0.25;
        const x = size / 2 + Math.cos(offsetAngle) * offsetDist;
        const y = size / 2 + Math.sin(offsetAngle) * offsetDist;
        const colorIdx = idx % colors.length;
        const bgGrad = ctx.createRadialGradient(x, y, 0, x, y, shapeSize * 2);
        bgGrad.addColorStop(0, colors[colorIdx] + "44");
        bgGrad.addColorStop(1, colors[colorIdx] + "00");
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(x, y, shapeSize * 2, 0, Math.PI * 2);
        ctx.fill();
        if (result.value % 3 === 0) {
          ctx.fillStyle = colors[colorIdx] + "DD";
          ctx.beginPath();
          ctx.arc(x, y, shapeSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (result.value % 3 === 1) {
          ctx.fillStyle = colors[colorIdx] + "DD";
          ctx.fillRect(
            x - shapeSize,
            y - shapeSize,
            shapeSize * 2,
            shapeSize * 2
          );
        } else {
          ctx.fillStyle = colors[colorIdx] + "DD";
          ctx.beginPath();
          ctx.moveTo(x, y - shapeSize);
          ctx.lineTo(x + shapeSize, y + shapeSize);
          ctx.lineTo(x - shapeSize, y + shapeSize);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = colors[(colorIdx + 1) % colors.length] + "FF";
        ctx.lineWidth = 4;
        ctx.stroke();
      });
    }

    ctx.globalCompositeOperation = "screen";
    const overallGlow = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    overallGlow.addColorStop(0, colors[0] + "11");
    overallGlow.addColorStop(1, colors[colors.length - 1] + "00");
    ctx.fillStyle = overallGlow;
    ctx.fillRect(0, 0, size, size);

    return canvas.toDataURL();
  };

  const generateQuantumArt = async () => {
    setIsGenerating(true);
    setStatus("Generating quantum circuit...");
    setArtData(null);

    try {
      const circuit = generateQuantumCircuit();
      setStatus("Running quantum simulation...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const counts = simulateQuantumCircuit(circuit);
      setStatus("Generating art from quantum results...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const imageUrl = generateArtFromResults(counts, circuit);
      setArtData({
        image: imageUrl,
        jobId: "qc-" + Math.random().toString(36).substr(2, 9),
        counts: counts,
        timestamp: new Date().toISOString(),
      });
      setStatus("✨ Quantum art generated successfully!");
      setIsGenerating(false);
    } catch (err) {
      console.error("Error:", err);
      setStatus("Error generating art");
      setIsGenerating(false);
    }
  };

  const downloadArt = () => {
    if (!artData) return;
    const link = document.createElement("a");
    link.download = "quantum-art-" + artData.jobId + ".png";
    link.href = artData.image;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quantum Canvas
            </h1>
          </div>
          <p className="text-lg md:text-xl text-purple-200">
            Generate unique art using quantum computing
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Powered by quantum mechanics simulation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 border border-purple-500/20">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 md:w-6 md:h-6" />
                Art Parameters
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Quantum Style
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {Object.entries(styles).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setStyle(key)}
                      className={
                        "p-2 md:p-3 rounded-lg border-2 transition-all text-left " +
                        (style === key
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-700/30 hover:border-purple-500/50")
                      }
                    >
                      <div className="font-semibold text-sm md:text-base">
                        {data.name}
                      </div>
                      <div className="text-xs text-purple-300 mt-1">
                        {data.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Color Palette
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {Object.entries(colorSchemes).map(([key, colors]) => (
                    <button
                      key={key}
                      onClick={() => setColorScheme(key)}
                      className={
                        "p-2 md:p-3 rounded-lg border-2 transition-all " +
                        (colorScheme === key
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-700/30 hover:border-purple-500/50")
                      }
                    >
                      <div className="font-semibold capitalize mb-2 text-sm md:text-base">
                        {key}
                      </div>
                      <div className="flex gap-1">
                        {colors.map((color, i) => (
                          <div
                            key={i}
                            className="h-3 md:h-4 flex-1 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Complexity: {complexity} qubits
                </label>
                <input
                  type="range"
                  min="3"
                  max="5"
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-purple-300 mt-2">
                  Higher complexity = more intricate patterns
                </div>
              </div>
              <button
                onClick={generateQuantumArt}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isGenerating ? (
                  <React.Fragment>
                    <Cpu className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Generating...
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                    Generate Quantum Art
                  </React.Fragment>
                )}
              </button>
              {status && (
                <div className="mt-4 p-3 bg-purple-900/30 rounded-lg text-xs md:text-sm text-purple-200">
                  {status}
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 border border-purple-500/20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
              Quantum Art
            </h2>
            {artData ? (
              <div>
                <img
                  src={artData.image}
                  alt="Quantum Art"
                  className="w-full rounded-lg mb-4 border-2 border-purple-500/30"
                />
                <button
                  onClick={downloadArt}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all flex items-center justify-center gap-2 mb-4 text-sm md:text-base"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  Download Art
                </button>
                <div className="bg-slate-900/50 rounded-lg p-3 md:p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Job ID:</span>
                    <span className="font-mono text-xs">{artData.jobId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Created:</span>
                    <span className="text-xs">
                      {new Date(artData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <div className="text-purple-300 mb-2">
                      Top Measurements:
                    </div>
                    <div className="max-h-24 md:max-h-32 overflow-y-auto space-y-1">
                      {Object.entries(artData.counts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([bits, count]) => (
                          <div
                            key={bits}
                            className="flex justify-between text-xs"
                          >
                            <span className="font-mono">{bits}</span>
                            <span className="text-purple-400">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 md:h-96 flex items-center justify-center border-2 border-dashed border-purple-500/30 rounded-lg">
                <div className="text-center text-purple-300">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm md:text-base">
                    Your quantum art will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 md:mt-12 text-center text-xs md:text-sm text-purple-300">
          <p>Each piece uses real quantum mechanics principles</p>
          <p className="mt-2">
            Created with superposition, entanglement, and quantum measurement
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuantumArtGenerator;

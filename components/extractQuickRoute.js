const fs = require("fs");

// ---------- helpers ----------
function readUInt16BE(buf, offset) {
  return buf.readUInt16BE(offset);
}

function readUInt32LE(buf, offset) {
  return buf.readUInt32LE(offset);
}

function readInt32LE(buf, offset) {
  return buf.readInt32LE(offset);
}

function readDoubleLE(buf, offset) {
  return buf.readDoubleLE(offset);
}

function readLongLat(buf, offset) {
  return {
    lon: readInt32LE(buf, offset) / 3600000,
    lat: readInt32LE(buf, offset + 4) / 3600000,
  };
}

function extractQuickRoute(filename) {
  const buf = fs.readFileSync(filename);
  console.log("Read file:", filename, buf.length, "bytes");

  let pos = 2; // skip SOI (FFD8)

  while (pos < buf.length) {
    if (buf[pos] !== 0xff) break;

    const marker = buf[pos + 1];
    const length = readUInt16BE(buf, pos + 2);

    if (marker === 0xe0) {
      // APP0
      const start = pos + 4;
      const end = start + length - 2;
      const block = buf.slice(start, end);

      const qrIndex = block.indexOf(Buffer.from("QuickRoute"));
      if (qrIndex !== -1) {
        console.log("✅ QuickRoute APP0 found");
        return parseQuickRoute(block, qrIndex);
      }
    }

    pos += 2 + length;
  }

  console.log("❌ No QuickRoute APP0 block found");
}

function parseQuickRoute(block, qrIndex) {
  let offset = qrIndex + "QuickRoute".length;

  let mapCorners = null;
  let rotationDeg = null;

  while (offset + 5 <= block.length) {
    const tag = block[offset];
    const length = readUInt32LE(block, offset + 1);
    const data = block.slice(offset + 5, offset + 5 + length);

    if (tag === 2 && length >= 32) {
      mapCorners = [
        readLongLat(data, 0),
        readLongLat(data, 8),
        readLongLat(data, 16),
        readLongLat(data, 24),
      ];
    }

    if (tag === 5) {
      const r = parseSessions(data);
      if (r !== undefined) {
        rotationDeg = r;
      }
    }

    offset += 5 + length;
  }

  console.log("MapCornerPositions:", mapCorners);
  console.log("Rotation (deg):", rotationDeg);

  return { mapCorners, rotationDeg };
}

function parseSessions(buf) {
  let pos = 0;
  const sessionCount = buf.readUInt32LE(pos);
  pos += 4;
  console.log("Session count:", sessionCount);

  for (let i = 0; i < sessionCount; i++) {
    const tag = buf[pos]; // <-- will be 0
    pos += 1;
    const len = buf.readUInt32LE(pos);
    pos += 4;

    const data = buf.slice(pos, pos + len);
    pos += len;

    console.log(`Session ${i}, tag ${tag}, length ${len}`);

    if (tag === 6) {
      return parseSession(data); // <-- recurse
    }
  }
}

function parseSession(buf) {
  let pos = 0;

  while (pos + 5 <= buf.length) {
    const tag = buf[pos];

    pos += 1;
    const len = buf.readUInt32LE(pos);
    pos += 4;

    const data = buf.slice(pos, pos + len);
    pos += len;

    console.log(` Session tag ${tag}, length ${len}`);

    if (tag === 8) {
      return parseHandles(data);
    }
  }
}

function parseHandles(data) {
  const handleCount = data.readUInt32LE(0);
  if (handleCount === 0) return;

  let p = 4;

  // First handle only
  const m00 = data.readDoubleLE(p); // row 0 col 0
  const m01 = data.readDoubleLE(p + 8);
  const m10 = data.readDoubleLE(p + 24); // row 1 col 0

  const rotationRad = Math.atan2(m10, m00);
  const rotationDeg = (-rotationRad * 180) / Math.PI;

  console.log("Rotation:", rotationDeg);
  return rotationDeg;
}

module.exports = extractQuickRoute;

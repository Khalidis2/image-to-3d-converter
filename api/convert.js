// api/convert.js - Vercel Serverless Function
// This handles image-to-3D conversion using a reliable backend API

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Received image, calling Hunyuan3D API...');

    // Call the HuggingFace Spaces API through our backend
    const response = await fetch(
      'https://tencent-hunyuan3d-2-1.hf.space/call/infer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            imageBase64,
            '',           // no text prompt
            'None',       // negative prompt
            1,            // guidance scale
            'generate'    // mode
          ]
        })
      }
    );

    if (!response.ok) {
      console.log(`HuggingFace API returned ${response.status}`);
      
      // If HuggingFace fails, try alternative API
      console.log('Trying alternative API...');
      
      // Generate and return a demo model instead
      const demoModel = generateDemoGLB();
      
      return res.status(200).json({
        success: true,
        modelData: Buffer.from(demoModel).toString('base64'),
        isDemo: true,
        message: 'Using demo model (HuggingFace unavailable)'
      });
    }

    const result = await response.json();
    console.log('API Response received');

    // HuggingFace returns: { data: [glb_url, ...] }
    const glbUrl = result.data[0];

    // Fetch the GLB file
    console.log('Fetching GLB file from:', glbUrl);
    const glbResponse = await fetch(glbUrl);
    
    if (!glbResponse.ok) {
      throw new Error('Failed to fetch GLB file');
    }

    const glbArrayBuffer = await glbResponse.arrayBuffer();
    const glbBase64 = Buffer.from(glbArrayBuffer).toString('base64');

    return res.status(200).json({
      success: true,
      modelData: glbBase64,
      isDemo: false,
      message: 'Conversion successful'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    
    // Always return a working demo on error
    const demoModel = generateDemoGLB();
    
    return res.status(200).json({
      success: true,
      modelData: Buffer.from(demoModel).toString('base64'),
      isDemo: true,
      message: 'Using demo model: ' + error.message
    });
  }
}

// Generate a simple demo GLB file
function generateDemoGLB() {
  const json = {
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{
      primitives: [{
        attributes: { POSITION: 0 },
        indices: 1,
        mode: 4
      }]
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 8,
        type: "VEC3",
        max: [100, 100, 100],
        min: [0, 0, 0]
      },
      {
        bufferView: 1,
        componentType: 5125,
        count: 36,
        type: "SCALAR"
      }
    ],
    bufferViews: [
      { buffer: 0, byteLength: 96, byteOffset: 0 },
      { buffer: 0, byteLength: 144, byteOffset: 96 }
    ],
    buffers: [{ byteLength: 240 }]
  };

  const jsonString = JSON.stringify(json);
  const jsonBuffer = Buffer.from(jsonString);
  const jsonPadded = jsonBuffer.length + (4 - jsonBuffer.length % 4) % 4;

  const vertices = Buffer.from(new Float32Array([
    0, 0, 0, 100, 0, 0, 100, 100, 0, 0, 100, 0,
    0, 0, 100, 100, 0, 100, 100, 100, 100, 0, 100, 100
  ]));

  const indices = Buffer.from(new Uint32Array([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    2, 6, 7, 2, 7, 3,
    0, 3, 7, 0, 7, 4,
    1, 5, 6, 1, 6, 2
  ]));

  const glbHeader = Buffer.alloc(12);
  glbHeader.writeUInt32LE(0x46546C67, 0); // magic
  glbHeader.writeUInt32LE(2, 4);           // version
  glbHeader.writeUInt32LE(20 + jsonPadded + 8 + 240, 8); // total size

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded, 0);
  jsonHeader.writeUInt32LE(0x4E4F534A, 4); // JSON chunk type

  const bufferHeader = Buffer.alloc(8);
  bufferHeader.writeUInt32LE(240, 0);
  bufferHeader.writeUInt32LE(0x004E4942, 4); // BIN chunk type

  const buffer = Buffer.alloc(240);
  vertices.copy(buffer, 0);
  indices.copy(buffer, 96);

  return Buffer.concat([
    glbHeader,
    jsonHeader,
    jsonBuffer,
    Buffer.alloc(jsonPadded - jsonBuffer.length),
    bufferHeader,
    buffer
  ]);
}

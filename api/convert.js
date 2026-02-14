// api/convert.js - Vercel Serverless Function
// Uses TRELLIS 3D API for image-to-3D conversion

export default async function handler(req, res) {
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

    console.log('Received image, calling TRELLIS 3D API...');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Call TRELLIS 3D API through a CORS proxy (since it doesn't support direct CORS)
    // We'll use the web version via Upsampler which wraps TRELLIS
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'image.jpg');

    console.log('Sending image to TRELLIS 3D...');

    const response = await fetch('https://api.trellis3d.co/v1/generate', {
      method: 'POST',
      body: formData,
      timeout: 180000 // 3 minute timeout
    }).catch(err => {
      console.log('TRELLIS API error:', err.message);
      return null;
    });

    if (response && response.ok) {
      const result = await response.json();
      
      if (result.model_url) {
        console.log('Successfully generated 3D model');
        
        // Fetch the generated GLB file
        const modelResponse = await fetch(result.model_url);
        if (modelResponse.ok) {
          const modelArrayBuffer = await modelResponse.arrayBuffer();
          const modelBase64 = Buffer.from(modelArrayBuffer).toString('base64');
          
          return res.status(200).json({
            success: true,
            modelData: modelBase64,
            isDemo: false,
            message: 'Conversion successful using TRELLIS 3D'
          });
        }
      }
    }

    console.log('TRELLIS API failed, generating demo model...');
    const demoModel = generateDemoGLB();
    
    return res.status(200).json({
      success: true,
      modelData: Buffer.from(demoModel).toString('base64'),
      isDemo: true,
      message: 'Using demo model (API unavailable)'
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

// Generate a realistic demo GLB file (larger cube)
function generateDemoGLB() {
  // Create a more detailed cube mesh with proper scaling
  const vertices = new Float32Array([
    // Front face
    -50, -50, 50,   50, -50, 50,   50, 50, 50,   -50, 50, 50,
    // Back face
    -50, -50, -50,   -50, 50, -50,   50, 50, -50,   50, -50, -50,
    // Top face
    -50, 50, -50,   -50, 50, 50,   50, 50, 50,   50, 50, -50,
    // Bottom face
    -50, -50, -50,   50, -50, -50,   50, -50, 50,   -50, -50, 50,
    // Right face
    50, -50, -50,   50, 50, -50,   50, 50, 50,   50, -50, 50,
    // Left face
    -50, -50, -50,   -50, -50, 50,   -50, 50, 50,   -50, 50, -50
  ]);

  const indices = new Uint32Array([
    0, 1, 2,   0, 2, 3,      // Front
    4, 6, 5,   4, 7, 6,      // Back
    8, 9, 10,  8, 10, 11,    // Top
    12, 15, 14, 12, 14, 13,  // Bottom
    16, 17, 18, 16, 18, 19,  // Right
    20, 22, 21, 20, 23, 22   // Left
  ]);

  // Create GLB structure
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
        count: 24,
        type: "VEC3",
        max: [50, 50, 50],
        min: [-50, -50, -50]
      },
      {
        bufferView: 1,
        componentType: 5125,
        count: 36,
        type: "SCALAR"
      }
    ],
    bufferViews: [
      { buffer: 0, byteLength: 288, byteOffset: 0 },
      { buffer: 0, byteLength: 144, byteOffset: 288 }
    ],
    buffers: [{ byteLength: 432 }]
  };

  const jsonString = JSON.stringify(json);
  const jsonBuffer = Buffer.from(jsonString);
  const jsonPadded = jsonBuffer.length + (4 - jsonBuffer.length % 4) % 4;

  const verticesBuffer = Buffer.from(vertices);
  const indicesBuffer = Buffer.from(indices);
  const bufferContent = Buffer.alloc(432);
  
  verticesBuffer.copy(bufferContent, 0);
  indicesBuffer.copy(bufferContent, 288);

  const glbHeader = Buffer.alloc(12);
  glbHeader.writeUInt32LE(0x46546C67, 0);
  glbHeader.writeUInt32LE(2, 4);
  glbHeader.writeUInt32LE(20 + jsonPadded + 8 + 432, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded, 0);
  jsonHeader.writeUInt32LE(0x4E4F534A, 4);

  const bufferHeader = Buffer.alloc(8);
  bufferHeader.writeUInt32LE(432, 0);
  bufferHeader.writeUInt32LE(0x004E4942, 4);

  return Buffer.concat([
    glbHeader,
    jsonHeader,
    jsonBuffer,
    Buffer.alloc(jsonPadded - jsonBuffer.length),
    bufferHeader,
    bufferContent
  ]);
}

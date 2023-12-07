// Name: Cathrine Underbjerg Hansen and Marc Bohner

var gl;
var numVertices;
var numTriangles;
var near, far;
var aspect, fovy, left, right, bottom, test;
var projectionMatrix;
var R;
var indexList;
var myShaderProgram;
var isLight1On, isLight2On;
var specularOn;
var vertexNormals;
var faceNormals;
var alpha;
var thetaUniform;
var theta;
var Rotation;
var rotationMatrix;
var M;
var modelViewMatrix;
var M_x;
var M_y;
var vertexbuffer;
var vertexPosition;
var textureVertexbuffer;
var textureCoordinate;
var clipX;

async function initGL() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, 512, 512);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  myShaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(myShaderProgram);

  clipX = 1.0;

  var cameraPos = [0.0, -1.0, 3.0];

  var e = vec3(cameraPos[0], cameraPos[1], cameraPos[2]);
  var a = vec3(0.0, 1.0, 0.0);
  var vup = vec3(0.0, 1.0, 0.0);
  var d = subtract(e, a);
  var dCopy = vec3(d[0], d[1], d[2]);
  var n = normalize(dCopy);
  var k = cross(vup, n);
  var u = normalize(k);
  var l = cross(n, u);
  var v = normalize(l);

  var minv = mat4(
    u[0],
    u[1],
    u[2],
    dot(u, e),
    v[0],
    v[1],
    v[2],
    dot(v, e),
    n[0],
    n[1],
    n[2],
    dot(n, e),
    0.0,
    0.0,
    0.0,
    1.0
  );

  M = inverse(minv);

  aspect = canvas.height / canvas.width;
  fovy = (45 * Math.PI) / 180;

  var angle = -0.1;

  Rotation = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, Math.cos(angle), -Math.sin(angle), 0.0,
    0.0, Math.sin(angle), Math.cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  // Create translation matrices
  var translateToOrigin = mat4(
    1, 0, 0, -cameraPos[0],
    0, 1, 0, -cameraPos[1],
    0, 0, 1, -cameraPos[2],
    0, 0, 0, 1
  );

  var translateBack = mat4(
    1, 0, 0, cameraPos[0],
    0, 1, 0, cameraPos[1],
    0, 0, 1, cameraPos[2],
    0, 0, 0, 1
  );

// Translate to origin, rotate, then translate back
  //M = multiply(translateToOrigin, M);
  //M = multiply(Rotation, M);
  //M = multiply(translateBack, M);

  modelViewMatrix = gl.getUniformLocation(myShaderProgram, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(M));

  projectionMatrix = gl.getUniformLocation(myShaderProgram, "projectionMatrix");
  isLight1On = 0;
  isLight2On = 0;
  specularOn = 0;

  render();
  perspective();
  light1();
  light2();
  specular();
}

function perspective() {
  near = 0.001;

  far = 100;

  alpha = 1;

  test = near * Math.tan(fovy);
  right = test * aspect;
  left = -right;
  bottom = -test;

  var pPerspective = mat4(
    (2 * near) / (right - left),
    0,
    (right + left) / (right - left),
    0,
    0,
    (2 * near) / (test - bottom),
    (test + bottom) / (test - bottom),
    0,
    0,
    0,
    -(far + near) / (far - near),
    (-2 * far * near) / (far - near),
    0,
    0,
    -1,
    0
  );
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(pPerspective));

  render();
}

function light1() {
  isLight1On = 1- isLight1On;
  var p0 = vec3(1.2, 0.8, 1.9); // Point light position
  var Ia = vec3(0.2 * isLight1On, 0.2 * isLight1On, 0.2 * isLight1On); // Ambient light intensity
  var Id = vec3(1.0 * isLight1On, 1.0 * isLight1On, 1.0 * isLight1On); // Diffuse light intensity
  var Is = vec3(1.0 * isLight1On, 1.0 * isLight1On, 1.0 * isLight1On);

  var ka = vec3(0.9, 0.2, 0.2);
  var kd = vec3(0.9, 0.2, 0.2);
  var ks = vec3(1.0, 1.0, 1.0);

  var p0loc = gl.getUniformLocation(myShaderProgram, "p1");
  gl.uniform3fv(p0loc, flatten(p0));

  // send the light source intensity to the shader
  var Ialoc = gl.getUniformLocation(myShaderProgram, "Ia1");
  gl.uniform3fv(Ialoc, flatten(Ia));

  var Idloc = gl.getUniformLocation(myShaderProgram, "Id1");
  gl.uniform3fv(Idloc, flatten(Id));

  var Isloc = gl.getUniformLocation(myShaderProgram, "Is1");
  gl.uniform3fv(Isloc, flatten(Is));

  // send the material properties to the shader
  var kaloc = gl.getUniformLocation(myShaderProgram, "ka1");
  gl.uniform3fv(kaloc, flatten(ka));

  var kdloc = gl.getUniformLocation(myShaderProgram, "kd1");
  gl.uniform3fv(kdloc, flatten(kd));

  var ksloc = gl.getUniformLocation(myShaderProgram, "ks1");
  gl.uniform3fv(ksloc, flatten(ks));

  render();
}

function light2() {
  isLight2On = 1 - isLight2On;
  var p0 = vec3(1.5, 1.5, -0.5);
  var Ia = vec3(1.0 * isLight2On, 1.0 * isLight2On, 1.0 * isLight2On);
  var Id = vec3(1.0 * isLight2On, 1.0 * isLight2On, 1.0 * isLight2On);
  var Is = vec3(1.0 * isLight2On, 1.0 * isLight2On, 1.0 * isLight2On);

  var ka = vec3(0.9, 0.2, 0.2);
  var kd = vec3(0.9, 0.2, 0.2);
  var ks = vec3(1.0, 1.0, 1.0);

  // send the light source position to the shader
  var p0loc = gl.getUniformLocation(myShaderProgram, "p0");
  gl.uniform3fv(p0loc, flatten(p0));

  // send the light source intensity to the shader
  var Ialoc = gl.getUniformLocation(myShaderProgram, "Ia");
  gl.uniform3fv(Ialoc, flatten(Ia));

  var Idloc = gl.getUniformLocation(myShaderProgram, "Id");
  gl.uniform3fv(Idloc, flatten(Id));

  var Isloc = gl.getUniformLocation(myShaderProgram, "Is");
  gl.uniform3fv(Isloc, flatten(Is));

  // send the material properties to the shader
  var kaloc = gl.getUniformLocation(myShaderProgram, "ka");
  gl.uniform3fv(kaloc, flatten(ka));

  var kdloc = gl.getUniformLocation(myShaderProgram, "kd");
  gl.uniform3fv(kdloc, flatten(kd));

  var ksloc = gl.getUniformLocation(myShaderProgram, "ks");
  gl.uniform3fv(ksloc, flatten(ks));

  var lightDirectionLocation = gl.getUniformLocation(
    myShaderProgram,
    "lightDirection"
  );
  gl.uniform3fv(lightDirectionLocation, [0.0, 0.0, -1.0]); // The light is shining downwards

  var cutoffAngleLocation = gl.getUniformLocation(
    myShaderProgram,
    "cutoffAngle"
  );
  gl.uniform1f(cutoffAngleLocation, Math.PI / 2); // The cutoff angle is 90 degrees

  render();
}

function specular() {var specularOnLoc = gl.getUniformLocation(myShaderProgram, "specularOn");
  specularOn = 1 - specularOn;
  gl.uniform1f(specularOnLoc, specularOn);

  render();
}

function multiply(A, B) {
  var res = mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  var N = 4;
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      for (var k = 0; k < N; k++) {
        res[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return res;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawChessBoard();
  drawChair();
  drawTable();
  requestAnimFrame(render);
}

function moveXPos() {
  clipX += 0.1;
}

function moveXNeg() {
  if (clipX >= 1.0)
    clipX -= 0.1;
}

function drawChair() {
  drawChairTop();
  drawChairLeg1();
  drawChairLeg2();
  drawChairLeg3();
  drawChairLeg4();
  drawChairBack();
}

function drawChairTop() {
  const x_min = -0.3;
  const x_max = 0.3;
  const y_min = -0.5;
  const y_max = -0.55;
  const z_min = -0.3;
  const z_max = 0.3;

  var vertices = [
  // Front face
  x_min + clipX, y_min, z_max,
  x_max + clipX, y_min, z_max,
  x_max + clipX, y_max, z_max,
  x_min + clipX, y_max, z_max,
  // Back face
  x_min + clipX, y_min, z_min,
  x_min + clipX, y_max, z_min,
  x_max + clipX, y_max, z_min,
  x_max + clipX, y_min, z_min,
  // Top face
  x_min + clipX, y_max, z_min,
  x_min + clipX, y_max, z_max,
  x_max + clipX, y_max, z_max,
  x_max + clipX, y_max, z_min,
  // Bottom face
  x_min + clipX, y_min, z_min,
  x_max + clipX, y_min, z_min,
  x_max + clipX, y_min, z_max,
  x_min + clipX, y_min, z_max,
  // Right face
  x_max + clipX, y_min, z_min,
  x_max + clipX, y_max, z_min,
  x_max + clipX, y_max, z_max,
  x_max + clipX, y_min, z_max,
  // Left face
  x_min + clipX, y_min, z_min,
  x_min + clipX, y_min, z_max,
  x_min + clipX, y_max, z_max,
  x_min + clipX, y_max, z_min,
];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
    //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexList),
    gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
    myShaderProgram,
    "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChairLeg1() {
  const x_min = -0.3;
  const x_max = -0.25;
  const y_min = -1.0;
  const y_max = -0.5;
  const z_min = 0.25;
  const z_max = 0.3;

  var vertices = [
    // Front face
    x_min + clipX, y_min, z_max,
    x_max + clipX, y_min, z_max,
    x_max + clipX, y_max, z_max,
    x_min + clipX, y_max, z_max,
    // Back face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_max, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_min, z_min,
    // Top face
    x_min + clipX, y_max, z_min,
    x_min + clipX, y_max, z_max,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_max, z_min,
    // Bottom face
    x_min + clipX, y_min, z_min,
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_min, z_max,
    x_min + clipX, y_min, z_max,
    // Right face
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_min, z_max,
    // Left face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_min, z_max,
    x_min + clipX, y_max, z_max,
    x_min + clipX, y_max, z_min,
  ];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChairLeg2() {
  const x_min = 0.3;
  const x_max = 0.25;
  const y_min = -1.0;
  const y_max = -0.5;
  const z_min = 0.25;
  const z_max = 0.3;

  var vertices = [
    // Front face
    x_min + clipX, y_min, z_max,
    x_max + clipX, y_min, z_max,
    x_max + clipX, y_max, z_max,
    x_min + clipX, y_max, z_max,
    // Back face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_max, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_min, z_min,
    // Top face
    x_min + clipX, y_max, z_min,
    x_min + clipX, y_max, z_max,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_max, z_min,
    // Bottom face
    x_min + clipX, y_min, z_min,
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_min, z_max,
    x_min + clipX, y_min, z_max,
    // Right face
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_min, z_max,
    // Left face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_min, z_max,
    x_min + clipX, y_max, z_max,
    x_min + clipX, y_max, z_min,
  ];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChairLeg3() {
  const x_min = -0.3;
  const x_max = -0.25;
  const y_min = -1.0;
  const y_max = -0.5;
  const z_min = -0.25;
  const z_max = -0.3;

  var vertices = [
    // Front face
    x_min + clipX, y_min, z_max,
    x_max + clipX, y_min, z_max,
    x_max + clipX, y_max, z_max,
    x_min + clipX, y_max, z_max,
    // Back face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_max, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_min, z_min,
    // Top face
    x_min + clipX, y_max, z_min,
    x_min + clipX, y_max, z_max,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_max, z_min,
    // Bottom face
    x_min + clipX, y_min, z_min,
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_min, z_max,
    x_min + clipX, y_min, z_max,
    // Right face
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_min, z_max,
    // Left face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_min, z_max,
    x_min + clipX, y_max, z_max,
    x_min + clipX, y_max, z_min,
  ];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChairLeg4() {
  const x_min = 0.3;
  const x_max = 0.25;
  const y_min = -1.0;
  const y_max = -0.5;
  const z_min = -0.25;
  const z_max = -0.3;

  var vertices = [
    // Front face
    x_min + clipX, y_min, z_max,
    x_max + clipX, y_min, z_max,
    x_max + clipX, y_max, z_max,
    x_min + clipX, y_max, z_max,
    // Back face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_max, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_min, z_min,
    // Top face
    x_min + clipX, y_max, z_min,
    x_min + clipX, y_max, z_max,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_max, z_min,
    // Bottom face
    x_min + clipX, y_min, z_min,
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_min, z_max,
    x_min + clipX, y_min, z_max,
    // Right face
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_min, z_max,
    // Left face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_min, z_max,
    x_min + clipX, y_max, z_max,
    x_min + clipX, y_max, z_min,
  ];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChairBack() {
  const x_min = 0.3;
  const x_max = 0.25;
  const y_min = -0.55;
  const y_max = 0.0;
  const z_min = -0.3;
  const z_max = 0.3;

  var vertices = [
    // Front face
    x_min + clipX, y_min, z_max,
    x_max + clipX, y_min, z_max,
    x_max + clipX, y_max, z_max,
    x_min + clipX, y_max, z_max,
    // Back face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_max, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_min, z_min,
    // Top face
    x_min + clipX, y_max, z_min,
    x_min + clipX, y_max, z_max,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_max, z_min,
    // Bottom face
    x_min + clipX, y_min, z_min,
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_min, z_max,
    x_min + clipX, y_min, z_max,
    // Right face
    x_max + clipX, y_min, z_min,
    x_max + clipX, y_max, z_min,
    x_max + clipX, y_max, z_max,
    x_max + clipX, y_min, z_max,
    // Left face
    x_min + clipX, y_min, z_min,
    x_min + clipX, y_min, z_max,
    x_min + clipX, y_max, z_max,
    x_min + clipX, y_max, z_min,
  ];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chairimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawChessBoard() {
  const x_min = 0.15;
  const x_max = 0.95;
  const y_min = 0.2;
  const y_max = 0.25;
  const z_min = -0.4;
  const z_max = 0.4;

  var vertices = [
    // Front face
    x_min, y_min, z_max,
    x_max, y_min, z_max,
    x_max, y_max, z_max,
    x_min, y_max, z_max,
    // Back face
    x_min, y_min, z_min,
    x_min, y_max, z_min,
    x_max, y_max, z_min,
    x_max, y_min, z_min,
    // Top face
    x_min, y_max, z_min,
    x_min, y_max, z_max,
    x_max, y_max, z_max,
    x_max, y_max, z_min,
    // Bottom face
    x_min, y_min, z_min,
    x_max, y_min, z_min,
    x_max, y_min, z_max,
    x_min, y_min, z_max,
    // Right face
    x_max, y_min, z_min,
    x_max, y_max, z_min,
    x_max, y_max, z_max,
    x_max, y_min, z_max,
    // Left face
    x_min, y_min, z_min,
    x_min, y_min, z_max,
    x_min, y_max, z_max,
    x_min, y_max, z_min,
  ];

  var textureCoordinates = [
  // Front
  0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0,
  // Back
  0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0,
  // Top
  0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
  // Bottom
  0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0,
  // Right
  0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0,
  // Left
  0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0,
];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("chessimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawTable() {
    drawTableTop();
    drawTableLeg();
}

function drawTableTop() {
  const x_min = -1.0;
  const x_max = 1.0;
  const y_min = 0.1;
  const y_max = 0.2;
  const z_min = -1.0;
  const z_max = 1.0;

  var vertices = [
  // Front face
  x_min, y_min, z_max,
  x_max, y_min, z_max,
  x_max, y_max, z_max,
  x_min, y_max, z_max,
  // Back face
  x_min, y_min, z_min,
  x_min, y_max, z_min,
  x_max, y_max, z_min,
  x_max, y_min, z_min,
  // Top face
  x_min, y_max, z_min,
  x_min, y_max, z_max,
  x_max, y_max, z_max,
  x_max, y_max, z_min,
  // Bottom face
  x_min, y_min, z_min,
  x_max, y_min, z_min,
  x_max, y_min, z_max,
  x_min, y_min, z_max,
  // Right face
  x_max, y_min, z_min,
  x_max, y_max, z_min,
  x_max, y_max, z_max,
  x_max, y_min, z_max,
  // Left face
  x_min, y_min, z_min,
  x_min, y_min, z_max,
  x_min, y_max, z_max,
  x_min, y_max, z_min,
];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("tableimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

function drawTableLeg() {
  const x_min = -0.1;
  const x_max = 0.1;
  const y_min = -1.0;
  const y_max = 0.0;
  const z_min = -0.1;
  const z_max = 0.1;

  var vertices = [
  // Front face
  x_min, y_min, z_max,
  x_max, y_min, z_max,
  x_max, y_max, z_max,
  x_min, y_max, z_max,
  // Back face
  x_min, y_min, z_min,
  x_min, y_max, z_min,
  x_max, y_max, z_min,
  x_max, y_min, z_min,
  // Top face
  x_min, y_max, z_min,
  x_min, y_max, z_max,
  x_max, y_max, z_max,
  x_max, y_max, z_min,
  // Bottom face
  x_min, y_min, z_min,
  x_max, y_min, z_min,
  x_max, y_min, z_max,
  x_min, y_min, z_max,
  // Right face
  x_max, y_min, z_min,
  x_max, y_max, z_min,
  x_max, y_max, z_max,
  x_max, y_min, z_max,
  // Left face
  x_min, y_min, z_min,
  x_min, y_min, z_max,
  x_min, y_max, z_max,
  x_min, y_max, z_min,
];

  var textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ];

  var indexList = [
    //Front
    0, 1, 2, 0, 2, 3,

    //Back
    4, 5, 6, 4, 6, 7,

    //Top
    8, 9, 10, 8, 10, 11,

    //Bottom
    12, 13, 14, 12, 14, 15,

    //Right
    16, 17, 18, 16, 18, 19,

    //Left
    20, 21, 22, 20, 22, 23,
  ];

  var image = document.getElementById("tableimg");

  var textureImage = gl.createTexture(); // for flower image
  gl.bindTexture(gl.TEXTURE_2D, textureImage);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.uniform1i(gl.getUniformLocation(myShaderProgram, "texMap0"), 0);
  //gl.generateMipmap( gl.TEXTURE_2D ); // only use this if the image is a power of 2

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexList),
      gl.STATIC_DRAW
  );

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var textureVertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates), gl.STATIC_DRAW);

  var textureCoordinate = gl.getAttribLocation(
      myShaderProgram,
      "textureCoordinate"
  );
  gl.vertexAttribPointer(textureCoordinate, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(textureCoordinate);

  gl.drawElements(gl.TRIANGLES, indexList.length, gl.UNSIGNED_SHORT, 0);
}

/*
function rotate(value) {
  theta += value;
  M_x = mat4(
      1,
      0,
      0,
      0,
      0,
      Math.cos(theta),
      -Math.sin(theta),
      0,
      0,
      Math.sin(theta),
      Math.cos(theta),
      0,
      0,
      0,
      0,
      1
  );
  var beta = 0;
  M_y = mat4(
      Math.cos(beta),
      0,
      -Math.sin(beta),
      0,
      0,
      1,
      0,
      0,
      Math.sin(beta),
      0,
      Math.cos(beta),
      0,
      0,
      0,
      0,
      1
  );

  M_x_model = gl.getUniformLocation(myShaderProgram, "M_x");
  gl.uniformMatrix4fv(M_x_model, false, flatten(M_x));
  M_y_model = gl.getUniformLocation(myShaderProgram, "M_y");
  gl.uniformMatrix4fv(M_y_model, false, flatten(M_y));

  var objectPos = [0, 0, -4];
  var translateToOrigin = mat4(
      1,
      0,
      0,
      -objectPos[0],
      0,
      1,
      0,
      -objectPos[1],
      0,
      0,
      1,
      -objectPos[2],
      0,
      0,
      0,
      1
  );
  var translateBack = mat4(
      1,
      0,
      0,
      objectPos[0],
      0,
      1,
      0,
      objectPos[1],
      0,
      0,
      1,
      objectPos[2],
      0,
      0,
      0,
      1
  );

  Rotation = mat4(
      Math.cos(theta),
      0.0,
      -Math.sin(theta),
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      Math.sin(theta),
      0.0,
      Math.cos(theta),
      0.0,
      0.0,
      0.0,
      0.0,
      1.0
  );

  var M_new = multiply(translateToOrigin, M);
  //var Rotation = multiply(M_x, M_y);
  console.log(M_new);
  M_new = multiply(Rotation, M_new);
  M_new = multiply(translateBack, M_new);
  console.log(M);
  console.log(M_new);

  modelViewMatrix = gl.getUniformLocation(myShaderProgram, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(M_new));

  drawCube();
}

function rotatePos() {
  rotate(0.1);
}

function rotateNeg() {
  rotate(-0.1);
}*/

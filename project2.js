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

  theta = 0.0;
  thetaUniform = gl.getUniformLocation(myShaderProgram, "theta");
  gl.uniform1f(thetaUniform, theta);

  // The following block of code together with the
  // definitions in object.js are provided for diagnosis
  //
  // For full credit, REPLACE THE FOLLOWING BLOCK with
  // a block that loads the vertices and faces from the provided ply file
  // You are encouraged to explore THREE.js by using ChatGPT
  // to investigate how to load a PLY file and get
  // access to the vertices and faces
  //

  /* vertices = getVertices(); // currently defined in object.js
  indexList = getFaces();
  t = getFaces(); */

  // load the object.ply model instead of using the object.js
  const model = await loadPlyModel("./object.ply");

  vertices = model.vertices;
  indexList = model.indices;
  t = model.indices;

  numVertices = vertices.length;
  numTriangles = indexList.length / 3;
  // End of block on reading vertices and faces that you should replace

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexList),
    gl.STATIC_DRAW
  );

  var verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  var e = vec3(0.0, 0.0, 4.0);
  var a = vec3(14.0, 0.0, 0.0);
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

  near = 0.001;

  far = 100;

  aspect = canvas.height / canvas.width;
  fovy = (45 * Math.PI) / 180;

  isLight1On = 0;
  isLight2On = 0;
  specularOn = 0;

  alpha = 1;

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

  M = multiply(Rotation, M);

  modelViewMatrix = gl.getUniformLocation(myShaderProgram, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(M));

  projectionMatrix = gl.getUniformLocation(myShaderProgram, "projectionMatrix");

  faceNormals = getFaceNormals(vertices, indexList, numTriangles);

  // Calculate vertex normals
  vertexNormals = getVertexNormals(
    vertices,
    indexList,
    faceNormals,
    numVertices,
    numTriangles
  );

  // Create and bind a buffer for the vertex normals
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);

  // Get the attribute location for normal vectors and enable it
  var nvPosition = gl.getAttribLocation(myShaderProgram, "nv");
  gl.vertexAttribPointer(nvPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(nvPosition);

  var alphaloc = gl.getUniformLocation(myShaderProgram, "alpha");
  gl.uniform1f(alphaloc, alpha);

  perspective();
  light1();
  light2();
}

function perspective() {
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

  drawObject();
}

function light1() {
  isLight1On = 1;

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

  drawObject();
}

function light2() {
  isLight2On = 1;

  var p0 = vec3(1.5, 0.0, -1.5);
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

  drawObject();
}

function specular() {
  specularOn = 1;

  var specularOnLoc = gl.getUniformLocation(myShaderProgram, "specularOn");
  gl.uniform1f(specularOnLoc, specularOn);

  drawObject();
}

function drawObject() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0);
}

function getFaceNormals(vertices, indexList, numTriangles) {
  var faceNormals = [];

  for (var i = 0; i < numTriangles; i++) {
    p0 = vertices[indexList[3 * i]];
    p1 = vertices[indexList[3 * i + 1]];
    p2 = vertices[indexList[3 * i + 2]];

    var v1 = subtract(p1, p0);
    var v2 = subtract(p2, p0);

    var n = cross(v1, v2);
    var nCopy = vec3(n[0], n[1], n[2]);
    var n = normalize(nCopy);
    faceNormals.push(n);
  }

  return faceNormals;
}

function getVertexNormals(
  vertices,
  indexList,
  faceNormals,
  numVertices,
  numTriangles
) {
  var vertexNormals = [];

  for (var j = 0; j < numVertices; j++) {
    var vertexNormal = vec3(0.0, 0.0, 0.0); // Initialize to zero vector
    for (var i = 0; i < numTriangles; i++) {
      if (
        indexList[3 * i] == j ||
        indexList[3 * i + 1] == j ||
        indexList[3 * i + 2] == j
      ) {
        vertexNormal = add(vertexNormal, faceNormals[i]); // Use vector addition
      }
    }
    vertexNormal = normalize(vertexNormal);
    vertexNormals.push(vertexNormal);
  }

  return vertexNormals;
}

async function loadPlyModel(url) {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.split("\n");
  const vertices = [];
  const indices = [];

  let readingVertices = false;
  let readingFaces = false;
  let vertexCount = 0;
  let faceCount = 0;

  for (const line of lines) {
    if (line.startsWith("element vertex")) {
      vertexCount = Number(line.split(" ")[2]);
    } else if (line.startsWith("element face")) {
      faceCount = Number(line.split(" ")[2]);
    } else if (line.startsWith("end_header")) {
      readingVertices = true;
    } else if (readingVertices) {
      const [x, y, z] = line.split(" ").map(Number);
      vertices.push(vec4(x, y, z, 1.0));
      vertexCount--;
      if (vertexCount === 0) {
        readingVertices = false;
        readingFaces = true;
      }
    } else if (readingFaces) {
      const [, ...verts] = line.split(" ").map(Number);
      indices.push(...verts.slice(0, -1));
      faceCount--;
      if (faceCount === 0) {
        readingFaces = false;
      }
    }
  }

  return { vertices, indices };
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

function rotate(value) {
  // Force WebGL context to clear the color buffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  theta += value; // rotat positive
  //clipX += moveRight * nudge;
  //clipY += moveUp * nudge;

  gl.uniform1f(thetaUniform, theta);
  //gl.uniform2f(mousePositionUniform, clipX, clipY);

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

  var MNew = multiply(Rotation, M);
  modelViewMatrix = gl.getUniformLocation(myShaderProgram, "modelViewMatrix");
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(MNew));
  drawObject();
}

function rotatePos() {
  rotate(0.1);
}

function rotateNeg() {
  rotate(-0.1);
}

(function(global) {

  /*
  * Constants and Main
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  var ANGLE_PER_SECOND = 45.0;
  var canvas,
    gl,
    program,
    last = Date.now(),
    paused = false,
    angle = 0.0,
    req,
    tick;

  glUtils.SL.init({ callback:function() { main(); } });

  function main() {
    canvas = document.getElementById("glcanvas");
    gl = glUtils.checkWebGL(canvas, { preserveDrawingBuffer: true });
    initShaders();
    initCallbacks();
    initGL();
    animate();
  }

  /*
  * Initialization
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function initShaders() {
    var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
      fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    program = glUtils.createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
  }

  function initCallbacks() {
    canvas.addEventListener('mousedown', onmousedown);
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
  }

  function initGL() {
    gl.clearColor(0,0,0,1);
  }

  /*
  * Rendering / Drawing / Animation
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function animate() {
    var modelMatrix = mat4.create();
    var uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
    tick = function() {
      updateAngle();
      draw(modelMatrix, uModelMatrix);
      req = requestAnimationFrame(tick);
    };
    tick();
  }

  function renderBuffers(arrays, points) {
    var attributes = program.vertexShader.attributes;
    for (var i=0; i<attributes.length; i++) {
      var name = attributes[i].name;
      for (var j=0; j<arrays.length; j++) {
        if (name == arrays[j].name) {
          var attr = gl.getAttribLocation(program, name);
          gl.enableVertexAttribArray(attr);
          gl.vertexAttribPointer(
            attr,
            arrays[j].size,
            gl.FLOAT,
            false,
            points.FSIZE*points.stride,
            points.FSIZE*arrays[j].offset
          );
        }
      }
    }
  }

  function updateAngle() {
    var now = Date.now();
    var time = (now - last) / 1000;
    last = now;
    angle = (angle + ANGLE_PER_SECOND * time) % 360;
  }

  // draw!
  function draw(modelMatrix, uModelMatrix) {
    var points = new Float32Array([
      // points
      +0.0, +0.0, 0, 1,
      +0.0, +2.0, 0, 1,
      +2.0, +0.0, 0, 1,
      +0.0, +0.0, 0, 1,
      +0.0, -2.0, 0, 1,
      +2.0, +0.0, 0, 1,
      +0.0, +0.0, 0, 1,
      +0.0, -2.0, 0, 1,
      -2.0, +0.0, 0, 1,
    ]);
    points.stride = 4;
    var arrays = [
      {name:'aPosition', size:2, offset:0},
    ];
    var n = points.length/points.stride;

    var pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    points.FSIZE = points.BYTES_PER_ELEMENT;
    renderBuffers(arrays, points);

    var radian = Math.PI * angle / 180.0;
    var modelMatrix = mat4.fromRotation(mat4.create(), radian, vec3.fromValues(0,0,1));
    var uModelMatrix = gl.getUniformLocation(program, 'uModelMatrix');
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    var uHeight = gl.getUniformLocation(program, 'uHeight');
    var uWidth = gl.getUniformLocation(program, 'uWidth');
    gl.uniform1f(uHeight, canvas.height);
    gl.uniform1f(uWidth,  canvas.width);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  /*
  * UI Events
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function keyDown(event) {
    if (String.fromCharCode(event.keyCode) == "P") {
      paused = !paused;
    }
  }

  function keyUp(event) {
    if (paused) {
      cancelAnimationFrame(req);
      req = undefined;
    }
    else {
      if (!req) {
        last = Date.now();
        tick();
      }
    }
  }

  function onmousedown(event) {
    var point = uiUtils.pixelInputToCanvasCoord(event, canvas);
    var pixels = new Uint8Array(4);
    gl.readPixels(point.x, point.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log(pixels);
  }

})(window || this);

var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document ||
  'webkitPointerLockElement' in document;

if (havePointerLock) {

  var element = document.body;

  var pointerlockchange = function (event) {

    if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement ===
      element) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = 'block';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function (event) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener('pointerlockchange', pointerlockchange, false);
  document.addEventListener('mozpointerlockchange', pointerlockchange, false);
  document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

  document.addEventListener('pointerlockerror', pointerlockerror, false);
  document.addEventListener('mozpointerlockerror', pointerlockerror, false);
  document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

  instructions.addEventListener('click', function (event) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

  }, false);

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  // camera.translateY(-6);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  var onKeyDown = function (event) {

    switch (event.keyCode) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function (event) {

    switch (event.keyCode) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

  // floor

  geometry = new THREE.PlaneGeometry(300, 300, 0, 0);
  geometry.rotateX(-Math.PI / 2);
  floorTexture = new THREE.TextureLoader().load(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTABCiDPjncx4Na0KlSx45XNMxLroHa06tAibR6GTb9ARirjMZQ');
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(20, 20);
  material = new THREE.MeshBasicMaterial({
      map: floorTexture
    }),
    mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // var geometry = new THREE.SphereGeometry(40, 40, 40, 0, Math.PI *2, 0, 0.5*Math.PI);
  // // var link = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRayHLURKisL2wZawPCnx-J-ahowfDwQ1MNjsPR2MtQVYn1QNfn'
  // var link = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTor4EAHb7F7hxsro75fqTODuZ8tMU06X_DmsjAddVTs-blsYiT'
  // // var link = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeB2k2p2tiNfag6-_1L_P-sU3m9VxL6HG0vMow4JkP72hvC9dD'
  // sphereTexture = new THREE.TextureLoader().load(link );
  // sphereTexture.wrapS = sphereTexture.wrapT = THREE.sphereTexture;
  // material = new THREE.MeshBasicMaterial({map: sphereTexture}),
  // ceiling = new THREE.Mesh(geometry, material);
  // ceiling.material.side = THREE.BackSide;

  // scene.add(ceiling);

  var objectLoader = new THREE.ObjectLoader();
  objectLoader.load("./app/assets/model_plan/house-plan.json", function (obj) {
    floorTexture = new THREE.TextureLoader().load('data:image/jpeg;base64,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');

    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    // floorTexture.repeat.set(20, 20);

    for (let i = -1; i < 35; i += 5) {
      // cube1 = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 0.2), new THREE.MeshBasicMaterial({
      //   color: 0xDDE342
      // }));
      cube1 = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 0.2), new THREE.MeshBasicMaterial({
        map: floorTexture
      }));
      cube1.position.set(i, 2.5, 4.8);
      obj.add(cube1);

    }
    // cube1 = new THREE.Mesh( new THREE.CubeGeometry( 3, 3, 0.2 ), new THREE.MeshBasicMaterial({ color: 0xDDE342}));
    // cube1.position.set(0, 2.5, 5);
    // obj.add(cube1);
    scene.add(obj);
    obj.position.set(-100, 0, 0);
    obj.scale.set(3, 3, 3);


  });




  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  if (controlsEnabled === true) {

    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects(objects);

    var onObject = intersections.length > 0;

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {

      velocity.y = Math.max(0, velocity.y);
      canJump = true;

    }

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    if (controls.getObject().position.y < 10) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;

  }

  renderer.render(scene, camera);

}
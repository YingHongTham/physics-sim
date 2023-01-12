// container is div that
function initThreeScene(container)
{
	var gThreeScene = new THREE.Scene();
	
	// Lights
	gThreeScene.add( new THREE.AmbientLight( 0x505050 ) );	
	gThreeScene.fog = new THREE.Fog( 0x000000, 0, 15 );				

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.2;
	spotLight.position.set( 2, 3, 3 );
	spotLight.castShadow = true;
	spotLight.shadow.camera.near = 3;
	spotLight.shadow.camera.far = 10;
	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;
	gThreeScene.add( spotLight );

	var dirLight = new THREE.DirectionalLight( 0x55505a, 1 );
	dirLight.position.set( 0, 3, 0 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 10;

	dirLight.shadow.camera.right = 1;
	dirLight.shadow.camera.left = - 1;
	dirLight.shadow.camera.top	= 1;
	dirLight.shadow.camera.bottom = - 1;

	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	gThreeScene.add( dirLight );
	
	// Geometry
	var ground = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 20, 20, 1, 1 ),
		new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
	);				

	ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
	ground.receiveShadow = true;
	gThreeScene.add( ground );
	
	var helper = new THREE.GridHelper( 20, 20 );
	helper.material.opacity = 1.0;
	helper.material.transparent = true;
	helper.position.set(0, 0.002, 0);
	gThreeScene.add( helper );				
	
  //=================
	// Renderer

	var gRenderer = new THREE.WebGLRenderer();
	gRenderer.shadowMap.enabled = true;
	gRenderer.setPixelRatio( window.devicePixelRatio );
	gRenderer.setSize( 0.8 * window.innerWidth, 0.8 * window.innerHeight );
	//window.addEventListener( 'resize', onWindowResize, false );
	container.appendChild( gRenderer.domElement );
	
  //=================
	// Camera
			
	var gCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100);
  gCamera.position.set(0, 1, 4);
	gCamera.updateMatrixWorld();	

	gThreeScene.add(gCamera);

  //=================
	// Camera Control
			
	var gCameraControl = new THREE.OrbitControls(gCamera, gRenderer.domElement);
	gCameraControl.zoomSpeed = 2.0;
	gCameraControl.panSpeed = 0.4;


  // lazy to deal with this for now..
	//function onWindowResize() {
  //window.addEventListener( 'resize', () => {
	//  gCamera.aspect = window.innerWidth / window.innerHeight;
	//  gCamera.updateProjectionMatrix();
	//  gRenderer.setSize(
  //    window.innerWidth,
  //    window.innerHeight);
  //}, false );

  return {
    scene: gThreeScene,
    renderer: gRenderer,
    camera: gCamera,
    control: gCameraControl,
  };
}

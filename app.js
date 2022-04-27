
//Raul Ramirez CST 325
'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);
var view  = 0;
var upClick = false;
var downClick = false;

var sunGeometry = null; // this will be created after loading from a file
var groundGeometry = null;
var backWallGeometry = null;
var frontWallGeometry = null;
var topWallGeometry = null;
var leftWallGeometry = null;
var rightWallGeometry = null;

var Mercury = null;
var Venus = null;
var Earth = null;
var Clouds = null;
var Moon = null;

var Mars = null;
var Jupiter = null;
var Saturn = null;
var Uranus = null;
var Neptune = null;

var particleSystemGeometry = null;
var Comet = null;




var projectionMatrix = new Matrix4();
var LightPosition = new Vector4(0, 1.5, 0, 0);

var mercuryPosition = new Vector4(1,1.5,0,0);
var venusPosition = new Vector4(1, 1.5, 0, 0);

var earthPosition = new Vector4(1,1.5,0,0);
var moonPosition = new Vector4(1,1.5,0,0);

var marsPosition = new Vector4(1, 1.5, 0, 0);
var jupiterPosition = new Vector4(1,1.5,0,0);
var saturnPosition = new Vector4(1, 1.5, 0,0);
var uranusPosition = new Vector4(1,1.5,0,0);
var neptunePosition = new Vector4(1, 1.5, 0, 0);

var initalParticleLocation = new Vector3(5.0,15.0,-10.0);
var initalCometLocation = new Vector3(5.05,15.05,-10.0)


// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
//step 16
var flatShaderProgram;
var particleProgram;


// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    sphereJSON: null,
    sunImage: null,
    starsImage: null,
    earthImage: null,
    moonImage: null,

    mercuryImage: null,
    venusImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    uranusImage:null,
    neptuneImage:null,

    milkyImage: null,
    cloudsImage: null,
    nightImage: null,
    ringImage: null,

    //step 14
    //step 16
    flatTextVS: null, flatTextFS:  null,
    simpleTextVS: null, simpleTextFS: null,

    unlitColorBillboardVS: null, unlitColorBillboardFS: null,
    particeImage: null,

};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();
        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");
    var viewing = document.getElementById("viewing");


    try {
        gl = canvas.getContext("webgl", { alpha: false });
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

       
      //  gl.enable(gl.CULL_FACE);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
       
        loadImage('./data/2k_sun.jpg'),
        loadImage('./data/2k_stars.jpg'),
        loadImage('./data/2k_earth_day.jpg'),
        loadImage('./data/2k_moon.jpg'),

        loadImage('./data/2k_mercury.jpg'),
        loadImage('./data/2k_venus.jpg'),
        loadImage('./data/2k_mars.jpg'),
        loadImage('./data/2k_jupiter.jpg'),
        loadImage('./data/2k_saturn.jpg'),
        loadImage('./data/2k_uranus.jpg'),
        loadImage('./data/2k_neptune.jpg'),

        //step 14
        //step 16
        fetch('./shaders/flat.color.vs.glsl').then((response) => {return response.text();}),
        fetch('./shaders/flat.color.fs.glsl').then((response) => {return response.text();}),

        loadImage('./data/2k_stars_milky.jpg'),
        loadImage('./data/2k_earth_clouds.jpg'),
        loadImage('./data/2k_earth_night.jpg'),
        loadImage('./data/2k_ring.png'),

        fetch('./shaders/particle.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/particle.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/particle.png')

    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.sphereJSON = values[2];

        loadedAssets.sunImage = values[3];
        loadedAssets.starsImage = values[4];
        loadedAssets.earthImage = values[5];
        loadedAssets.moonImage = values[6];

        loadedAssets.mercuryImage = values[7];
        loadedAssets.venusImage = values[8];
        loadedAssets.marsImage = values[9];
        loadedAssets.jupiterImage = values[10];
        loadedAssets.saturnImage = values[11];
        loadedAssets.uranusImage = values[12];
        loadedAssets.neptuneImage = values[13];
        //step 14
        //step 16
        loadedAssets.flatTextVS = values[14];
        loadedAssets.flatTextFS = values[15];

        loadedAssets.milkyImage = values[16];
        loadedAssets.cloudsImage = values[17];
        loadedAssets.nightImage = values[18];
        loadedAssets.ringImage = values[19];

        loadedAssets.unlitColorBillboardVS = values[20];
        loadedAssets.unlitColorBillboardFS = values[21];
        loadedAssets.particeImage = values[22];

    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        uLightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "vTexture"),
        alphaUniform: gl.getUniformLocation(phongShaderProgram, "uAlpha"),
    };
    //step 16
    flatShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.flatTextVS,loadedAssets.flatTextFS);

    flatShaderProgram.attributes = {
       vertexPositionAttribute: gl.getAttribLocation(flatShaderProgram, "aVertexPosition"),
       vertexNormalsAttribute:  gl.getAttribLocation(flatShaderProgram,"aNormal"),
       vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };
    flatShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix"),
        uLightPositionUniform: gl.getUniformLocation(flatShaderProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(flatShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(flatShaderProgram, "uAlpha"),

    };
    particleProgram = createCompiledAndLinkedShaderProgram(loadedAssets.unlitColorBillboardVS, loadedAssets.unlitColorBillboardFS);
    gl.useProgram(particleProgram, loadedAssets.particeImage);

    particleProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(particleProgram, "aVertexPosition"),
        vertexNormalsAttribute:  gl.getAttribLocation(flatShaderProgram,"aNormal"),
        vertexColorAttribute: gl.getAttribLocation(particleProgram, "aVertexColor"),
    };

    particleProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(particleProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(particleProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(particleProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(particleProgram, "uColor"),
        textureUniform: gl.getUniformLocation(particleProgram, "uTexture"),
    };
}

// -------------------------------------------------------------------------
function createScene() {
    //-------SkyBox
    groundGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    groundGeometry.create(loadedAssets.starsImage);
    
    backWallGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    backWallGeometry.create(loadedAssets.milkyImage);
    frontWallGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    frontWallGeometry.create(loadedAssets.starsImage);

    topWallGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    topWallGeometry.create(loadedAssets.starsImage);

    leftWallGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    leftWallGeometry.create(loadedAssets.starsImage);


    rightWallGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    rightWallGeometry.create(loadedAssets.starsImage);

    var n = 400.0;
    var moveDown = new Matrix4().makeTranslation(0,-n,0);

    var scale = new Matrix4().makeScale(n, n, n);

    // compensate for the model being flipped on its side
    var rotation = new Matrix4().makeRotationX(-90);

    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(moveDown).multiply(rotation).multiply(scale);

    rotation.makeRotationX(0);
    var gTranslate = new Matrix4().makeTranslation(0,n,-n);
    backWallGeometry.worldMatrix.makeIdentity();
    backWallGeometry.worldMatrix.multiply(moveDown).multiply(gTranslate).multiply(rotation).multiply(scale);

    gTranslate.makeTranslation(0,n,n);
    frontWallGeometry.worldMatrix.makeIdentity();
    frontWallGeometry.worldMatrix.multiply(moveDown).multiply(gTranslate).multiply(rotation).multiply(scale);

    rotation.makeRotationX(-90);
    gTranslate.makeTranslation(0,2*n,0);
    topWallGeometry.worldMatrix.makeIdentity();
    topWallGeometry.worldMatrix.multiply(moveDown).multiply(gTranslate).multiply(rotation).multiply(scale);

    rotation.makeRotationY(90);
    gTranslate.makeTranslation(n,n,0);
    rightWallGeometry.worldMatrix.makeIdentity();
    rightWallGeometry.worldMatrix.multiply(moveDown).multiply(gTranslate).multiply(rotation).multiply(scale);
   
    gTranslate.makeTranslation(-n,n,0);
    leftWallGeometry.worldMatrix.makeIdentity();
    leftWallGeometry.worldMatrix.multiply(moveDown).multiply(gTranslate).multiply(rotation).multiply(scale);

    //-------- Create Sun, Moon And Planets 
    var earthSize = .003;
    
    sunGeometry = new WebGLGeometryJSON(gl, flatShaderProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    Earth =  new WebGLGeometryJSON(gl, phongShaderProgram);
    Earth.create(loadedAssets.sphereJSON, loadedAssets.earthImage, loadedAssets.earthImage);

    Clouds = new WebGLGeometryJSON(gl, phongShaderProgram);
    Clouds.create(loadedAssets.sphereJSON, loadedAssets.cloudsImage);
    Clouds.alpha = .5;

   
    Moon = new WebGLGeometryJSON(gl, phongShaderProgram);
    Moon.create(loadedAssets.sphereJSON, loadedAssets.moonImage);

    Mercury =new WebGLGeometryJSON(gl, phongShaderProgram);
    Mercury.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);

    Venus =new WebGLGeometryJSON(gl, phongShaderProgram);
    Venus.create(loadedAssets.sphereJSON, loadedAssets.venusImage);

    Mars =new WebGLGeometryJSON(gl, phongShaderProgram);
    Mars.create(loadedAssets.sphereJSON, loadedAssets.marsImage);

    Jupiter =new WebGLGeometryJSON(gl, phongShaderProgram);
    Jupiter.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    Saturn =new WebGLGeometryJSON(gl, phongShaderProgram);
    Saturn.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);

    Uranus =new WebGLGeometryJSON(gl, phongShaderProgram);
    Uranus.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);

    Neptune =new WebGLGeometryJSON(gl, phongShaderProgram);
    Neptune.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);

    //-----SCALE THEM 

    // Scaled it down so that the diameter is 3
    var scale = new Matrix4().makeScale(earthSize*15, earthSize*15,earthSize*15);
    // raise it by the radius to make it sit on the ground
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);

    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(translation).multiply(scale);

    scale.makeScale(earthSize, earthSize,earthSize);

    Earth.worldMatrix.makeIdentity();
    Earth.worldMatrix.multiply(translation).multiply(scale);

    scale.makeScale(earthSize *1.05,earthSize *1.05,earthSize*1.05);
    Clouds.worldMatrix.makeIdentity();
    Clouds.worldMatrix.multiply(translation).multiply(scale);


    scale.makeScale(earthSize*.27, earthSize*.27, earthSize*.27);

    Moon.worldMatrix.makeIdentity();
    Moon.worldMatrix.multiply(translation).multiply(scale);

    scale.makeScale(earthSize * .383,earthSize *.383, earthSize*.383);

    Mercury.worldMatrix.makeIdentity();
    Mercury.worldMatrix.multiply(translation).multiply(scale);

    
    scale.makeScale(earthSize * .949,earthSize *.949, earthSize*.949);

    Venus.worldMatrix.makeIdentity();
    Venus.worldMatrix.multiply(translation).multiply(scale);

    
    scale.makeScale(earthSize * .532,earthSize *.532, earthSize*.532);

    Mars.worldMatrix.makeIdentity();
    Mars.worldMatrix.multiply(translation).multiply(scale);

    
    scale.makeScale(earthSize * 11.21,earthSize *11.21, earthSize*11.21);

    Jupiter.worldMatrix.makeIdentity();
    Jupiter.worldMatrix.multiply(translation).multiply(scale);

    
    scale.makeScale(earthSize * 9.45,earthSize *9.45, earthSize*9.45);

    Saturn.worldMatrix.makeIdentity();
    Saturn.worldMatrix.multiply(translation).multiply(scale);

    scale.makeScale(earthSize *4.01,earthSize *4.01, earthSize*4.01);

    Uranus.worldMatrix.makeIdentity();
    Uranus.worldMatrix.multiply(translation).multiply(scale);

    
    scale.makeScale(earthSize * 3.88,earthSize * 3.88, earthSize * 3.88);

    Neptune.worldMatrix.makeIdentity();
    Neptune.worldMatrix.multiply(translation).multiply(scale);

    //--particle

    Comet = new WebGLGeometryJSON(gl, phongShaderProgram);
    Comet.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    scale.makeScale(earthSize*.27, earthSize*.27, earthSize*.27);
    
    translation.makeTranslation(initalCometLocation);

    Comet.worldMatrix.makeIdentity();
    Comet.worldMatrix.multiply(translation).multiply(scale);

    translation.makeTranslation(initalParticleLocation);
    particleSystemGeometry = new WebGLGeometryParticles(gl, 1000,loadedAssets.sphereJSON);
    particleSystemGeometry.create(loadedAssets.particeImage);


    particleSystemGeometry.worldMatrix.makeIdentity();
    particleSystemGeometry.worldMatrix.multiply(translation);



   

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    //--rotations---
    var earthSpeed = 1;
    var rot = new Matrix4().makeRotationY(earthSpeed/27);
    sunGeometry.worldMatrix.multiply(rot);

    rot.makeRotationY(1);
    Earth.worldMatrix.multiply(rot);
    Moon.worldMatrix.multiply(rot);
    rot.makeRotationX(.4);
    var roty = new Matrix4().makeRotationY(1.5);
    Clouds.worldMatrix.multiply(rot).multiply(roty);

    //-----ORBITS-------
  
    var earthOrbit = 10;
    var earthSpeed = .1;
    var orbit = new Matrix4().makeRotationY(earthSpeed *1.3);
    moonPosition = orbit.multiplyVector(moonPosition);
    var dis = .6;
    Moon.worldMatrix.elements[3] = moonPosition.x * dis + Earth.worldMatrix.elements[3];
    Moon.worldMatrix.elements[11] = moonPosition.z * dis + Earth.worldMatrix.elements[11];
    
    orbit.makeRotationY(earthSpeed);
    earthPosition = orbit.multiplyVector(earthPosition);
    Earth.worldMatrix.elements[3] = earthPosition.x * earthOrbit;
    Earth.worldMatrix.elements[11] = earthPosition.z * earthOrbit;
    Clouds.worldMatrix.elements[3] = earthPosition.x * earthOrbit;
    Clouds.worldMatrix.elements[11] = earthPosition.z * earthOrbit;


    orbit.makeRotationY(earthSpeed * 1.59 );
    mercuryPosition = orbit.multiplyVector(mercuryPosition);
    Mercury.worldMatrix.elements[3] = mercuryPosition.x * earthOrbit *.387;
    Mercury.worldMatrix.elements[11] = mercuryPosition.z * earthOrbit* .387;

    orbit.makeRotationY(earthSpeed * 1.18 );
    venusPosition = orbit.multiplyVector(venusPosition);
    Venus.worldMatrix.elements[3] = venusPosition.x * earthOrbit *.723;
    Venus.worldMatrix.elements[11] = venusPosition.z * earthOrbit* .723;

    orbit.makeRotationY(earthSpeed * .808);
    marsPosition = orbit.multiplyVector(marsPosition);
    Mars.worldMatrix.elements[3] = marsPosition.x * earthOrbit *1.52;
    Mars.worldMatrix.elements[11] = marsPosition.z * earthOrbit* 1.52;

    orbit.makeRotationY(earthSpeed * .439);
    jupiterPosition = orbit.multiplyVector(jupiterPosition);
    Jupiter.worldMatrix.elements[3] = jupiterPosition.x * earthOrbit * 5.20;
    Jupiter.worldMatrix.elements[11] = jupiterPosition.z * earthOrbit* 5.20;


    orbit.makeRotationY(earthSpeed * .325);
    saturnPosition = orbit.multiplyVector(saturnPosition);
    Saturn.worldMatrix.elements[3] = saturnPosition.x * earthOrbit * 9.58;
    Saturn.worldMatrix.elements[11] = saturnPosition.z * earthOrbit* 9.58;
   
    orbit.makeRotationY(earthSpeed * .228);
    uranusPosition = orbit.multiplyVector(uranusPosition);
    Uranus.worldMatrix.elements[3] = uranusPosition.x * earthOrbit * 19.20;
    Uranus.worldMatrix.elements[11] = uranusPosition.z * earthOrbit* 19.20;

    orbit.makeRotationY(earthSpeed * .182);
    neptunePosition = orbit.multiplyVector(neptunePosition);
    Neptune.worldMatrix.elements[3] = neptunePosition.x * earthOrbit * 30;
    Neptune.worldMatrix.elements[11] = neptunePosition.z * earthOrbit * 30;

    var cometSpeed = -.001
    Comet.worldMatrix.elements[3] += cometSpeed;
    Comet.worldMatrix.elements[7] += cometSpeed;
    particleSystemGeometry.worldMatrix.elements[3] += cometSpeed;
    particleSystemGeometry.worldMatrix.elements[7] += cometSpeed;   

    if(Comet.worldMatrix.elements[7] < -5.0){
        Comet.worldMatrix.elements[3] =  initalCometLocation.x;
        Comet.worldMatrix.elements[7] =  initalCometLocation.y;

        var translation= new Matrix4().makeTranslation( initalParticleLocation);
        particleSystemGeometry = new WebGLGeometryParticles(gl, 1000,loadedAssets.sphereJSON);
        particleSystemGeometry.create(loadedAssets.particeImage);

        
    particleSystemGeometry.worldMatrix.makeIdentity();
    particleSystemGeometry.worldMatrix.multiply(translation);




    }
    

//----Camera around Sun Setting: 
    if(appInput.up){
        if(!upClick){
            upClick = true;
            view++;
            if(view >= 3)
                view = 0;
        }
    }
    if(!appInput.up){
        upClick = false;
    }
    if(appInput.down){
        if(!downClick){
            downClick = true;
            view --;
            if(view <= -1)
                view = 2;
        }
    }

    if(!appInput.down){
        downClick = false;
    }

    if(view == 0){
        camera.cameraTarget = new Vector4(0,1.5,0,0);
        camera.maxDistance = 10;
        camera.pitchDegrees = -4;
        camera.yawDegrees -= earthSpeed;
        viewing.innerHTML ="Sun";
    }else if(view ==1 ){

  
        camera.cameraTarget = new Vector4(
        Earth.worldMatrix.elements[3] = earthPosition.x * earthOrbit,
        1.5,
        Earth.worldMatrix.elements[11] = earthPosition.z * earthOrbit,
        0,
        );
        camera.maxDistance = 2;
        camera.pitchDegrees = 1.5;
        camera.yawDegrees += earthSpeed *.6;
        viewing.innerHTML ="Earth";
    }else if(view ==2){

        camera.cameraTarget = new Vector4(
        Neptune.worldMatrix.elements[3] = neptunePosition.x * earthOrbit * 31,
        1.5,
        Neptune.worldMatrix.elements[11] = neptunePosition.z * earthOrbit * 31,
        0
        );
        camera.yawDegrees += earthSpeed * .3 ;
        camera.maxDistance =5;
        camera.pitchDegrees = 1.5;
        viewing.innerHTML ="Neptune";
    }






    time.update();
    camera.update(time.deltaTime);

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();

    gl.uniform3f(uniforms.uLightPositionUniform, LightPosition.x, LightPosition.y, LightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
    


   

    projectionMatrix.makePerspective(60, aspectRatio, 0.1, 1000);
    topWallGeometry.render(camera, projectionMatrix, flatShaderProgram);
    groundGeometry.render(camera, projectionMatrix, flatShaderProgram);
    backWallGeometry.render(camera, projectionMatrix, flatShaderProgram);
    frontWallGeometry.render(camera, projectionMatrix, flatShaderProgram);
    rightWallGeometry.render(camera, projectionMatrix, flatShaderProgram);
    leftWallGeometry.render(camera, projectionMatrix, flatShaderProgram);



    sunGeometry.render(camera, projectionMatrix, flatShaderProgram);
    Earth.render(camera,projectionMatrix,phongShaderProgram);
    Moon.render(camera,projectionMatrix,phongShaderProgram);
    Mercury.render(camera,projectionMatrix,phongShaderProgram);
    Venus.render(camera,projectionMatrix,phongShaderProgram);
    Mars.render(camera,projectionMatrix,phongShaderProgram);
    Jupiter.render(camera,projectionMatrix,phongShaderProgram);
    Saturn.render(camera,projectionMatrix,phongShaderProgram);

    Uranus.render(camera,projectionMatrix,phongShaderProgram);
    Neptune.render(camera,projectionMatrix,phongShaderProgram);

    Comet.render(camera,projectionMatrix,flatShaderProgram);





    //--transparent objects 
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    Clouds.render(camera,projectionMatrix,phongShaderProgram);

    
    gl.disable(gl.BLEND);
    

    gl.useProgram(particleProgram);
    gl.depthMask(false);
    gl.uniform4f(particleProgram.uniforms.colorUniform, 1.0, 1.0, 0.5, 1.0);
    particleSystemGeometry.update(time.deltaTime, time.secondsElapsedSinceStart);
    particleSystemGeometry.render(camera, projectionMatrix, particleProgram);
    gl.depthMask(true);

   
  



    

}

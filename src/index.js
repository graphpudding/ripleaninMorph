import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import './component.js';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import * as GUI from 'babylonjs-gui';
BABYLON.GUI = GUI;
var canvas = document.getElementById("babylon");
var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false
  });
};
function $_GET(key) {
    var p = window.location.search;
    p = p.match(new RegExp(key + '=([^&=]+)'));
    return p ? p[1] : false;
}
//var createScene = async function() {
//  const scene = await BABYLON.SceneLoader.LoadAsync(
//    "scene/",
//    $_GET("model"),
//    engine
//);
let grass2;
let names = ["state_1.obj","state_2.obj","state_face_1.obj","state_face_2.obj"];
let nameNum = 0;
let createScene = function() {
  let scene = new BABYLON.Scene(engine);
  asyncLoad(scene);
  addCamera(scene);
  let lighting = BABYLON.CubeTexture.CreateFromPrefilteredData("scene/environmentSpecular.env", scene);
  lighting.name = "runyonCanyon";
  lighting.gammaSpace = false;
  scene.environmentTexture = lighting;
  scene.createDefaultSkybox(scene.environmentTexture, true, (scene.activeCamera.maxZ - scene.activeCamera.minZ) / 2, 0.3, false);
 var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
 grass2 = new BABYLON.StandardMaterial("grass2", scene);
 grass2.diffuseColor = new BABYLON.Color3(1, 0, 0);
 grass2.ambientTexture = new BABYLON.Texture("scene/grass.png", scene);
 grass2.emissiveColor = new BABYLON.Color3(1, 1, 1);
 grass2.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
  return scene;
}


function asyncLoad(scene){
  BABYLON.SceneLoader.AppendAsync("scene/morph/", names[nameNum],scene).then(()=>{//"https://motyo.monster/webdav/"
    scene.getMeshByName("mesh_mm1").dispose();
    scene.getMeshByName("ZBrush_defualt_group").name ="ZBrush_defualt_group"+nameNum
    if(nameNum < names.length - 1){
      scene.meshes.forEach((item, i) => {
        if(i>2){
        item.setEnabled(false);
        }
        item.setParent(null);
      });
      nameNum++;
      asyncLoad(scene);
    }else{
      afterLoad(scene);
    }
  })
}
//let camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3( 0.32161276833553787, -0.16917787249847976, -1.9667089450908692), scene);
//camera.angularSensibilityY = 3000;
//camera.angularSensibilityX = 3000;
//camera.lowerRadiusLimit = .1;
//camera.wheelPrecision = 30;
//camera.setTarget(BABYLON.Vector3.Zero());
//camera.attachControl(canvas, true);

function addCamera(scene) {
      scene.createDefaultCamera(true, true, true);

     var helperCamera = scene.cameras.pop();
     scene.cameras.push(helperCamera);
     let rads = []
       scene.meshes.forEach((item, i) => {
         rads.push(item.getBoundingInfo().boundingSphere.maximum.x)
     });


     helperCamera.radius = Math.max.apply(null, rads)*5;
     //helperCamera.alpha = Math.PI / 4;
     //helperCamera.beta = Math.PI / 4;
}


var asyncEngineCreation = async function() {
  console.log(createDefaultEngine())
  try {
    return createDefaultEngine();
  } catch (e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    return createDefaultEngine();
  }
}
window.initFunction = async function() {

  engine = await asyncEngineCreation();
  if (!engine) throw 'engine should not be null.';
  scene = await createScene();
  window.scene = scene;
};
window.initFunction().then(() => {
  sceneToRender = scene
  engine.runRenderLoop(function() {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function() {
  engine.resize();
});
function afterLoad(scene){

  function addTarget(item) {
    item.setEnabled(false);
    item.bakeCurrentTransformIntoVertices();
    let target = BABYLON.MorphTarget.FromMesh(item, "item", 0.25);
    manager.addTarget(target);
    let CRinput = document.createElement("input");
    CRinput.setAttribute("type","range");
    CRinput.setAttribute("id","js-"+item.name);
    CRinput.setAttribute("name","jsvolume");
    CRinput.setAttribute("min",1);
    CRinput.setAttribute("max",1000);
    document.querySelector(".js-inputs").appendChild(CRinput)
    let input = document.querySelector("#js-"+item.name);
    input.oninput = () => {
      target.influence = parseInt(input.value) / 1000;
    };
  }


  let manager = new BABYLON.MorphTargetManager();
  scene.getMeshByName("ZBrush_defualt_group0").morphTargetManager = manager;
  scene.getMeshByName("ZBrush_defualt_group0").material = grass2;
  let j=1;
  while(j<4){
    addTarget(scene.getMeshByName("ZBrush_defualt_group"+j))
    console.log(scene.getMeshByName("ZBrush_defualt_group"+j).name);
    j++;
  }


}

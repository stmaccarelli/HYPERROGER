THREE.SkyboxMaterial = function(path, format){

      format = format || '.jpg';
      var urls = [
          path + 'skybox_0' + format, path + 'skybox_1' + format,
          path + 'skybox_2' + format, path + 'skybox_3' + format,
          path + 'skybox_4' + format, path + 'skybox_5' + format
      ];

      var cubeMap = new THREE.CubeTextureLoader().load(urls);

  var cubeShader = THREE.ShaderLib['cube'];
  cubeShader.uniforms['tCube'].value = cubeMap;

  var skyBoxMaterial = new THREE.ShaderMaterial({
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });


  function replaceImages(path,format){
  }

  return{
    material:skyBoxMaterial,
    cubeMap:cubeMap,

  }
};

//
// var imagesCounter=0,imagesLoaded=0;
// function imageLoaded(){
//   imagesLoaded++;
//   console.log("images loaded "+imagesLoaded+"/"+imagesCounter);
//   if(imagesLoaded==imagesCounter) { console.log("all images loaded"); initMaterials();}
// }
// function loadTextures(){
//     for (var key in HL.textures)
//       if(HL.textures[key]!=null){
//         imagesCounter++;
//         HL.textures[key] = new THREE.TextureLoader().load( HL.textures[key], imageLoaded );
//       }
// }


var container;
var camera, scene, renderer;
var imagedata;
var N = 256;
var spotlight;
var sphere;

init();
animate();


function init()
{
    
    container = document.getElementById('container');
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(N/2, N*0.6, N*2.5);
    camera.lookAt(new THREE.Vector3(N/2, 0.0, N/2));
    
    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000ff, 1);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var img = new Image();
    img.onload = function()
    {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0 );
        imagedata = context.getImageData(0, 0, img.width, img.height);
        CreateTerrain();
    }
    img.src = 'js/pics/plateau.jpg';

    
    spotlight = new THREE.PointLight(0xffffff);
    spotlight.position.set(N/2, N*2, N/2);
    scene.add(spotlight);

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

}

function onWindowResize()
{
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
}

var alpha = 0.1;

function animate()
{
    /*var clock = new THREE.Clock();
    var delta = clock.getDelta();*/

    alpha += 0.01;
    
    requestAnimationFrame(animate);
    render();

    var x = N/2 + N*Math.cos(alpha);
    var y = 0 + N*Math.sin(alpha);

    spotlight.position.set(x, y, N/2);
    sphere.position.copy(spotlight.position);



}
function render()
{
    renderer.render(scene, camera);
}


function CreateTerrain()
{ 
    var geometry = new THREE.Geometry();

    for(var i= 0; i < N; i++){
        for (var j = 0; j < N; j++){
            var y = getPixel(imagedata, i, j);
            geometry.vertices.push(new THREE.Vector3( i, y/8.0, j));

        }
    }

    for(var i= 0; i < N-1; i++){
        for (var j = 0; j < N-1; j++){
            var ind0 =  i + j * N;
            var ind1 = (i + 1) + j * N;
            var ind2 = i + (j + 1) * N;
            var ind3 = (i + 1) + (j + 1) * N;

            geometry.faces.push(new THREE.Face3(ind0, ind1, ind3));
            geometry.faces.push(new THREE.Face3(ind0, ind3, ind2)); 
            
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), (j/(N-1))),
                new THREE.Vector2((i+1)/(N-1), j/(N-1)),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))]);
            
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(i/(N-1), (j/(N-1))),
                new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
                new THREE.Vector2(i/(N-1), (j+1)/(N-1))]); 
                
        }
    }
    
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    /*for(var i = 0; i < 162; i++){
    geometry.faces[i].vertexColors[0] = new THREE.Color(0xff0000);
    geometry.faces[i].vertexColors[1] = new THREE.Color(0x00ff00);
    geometry.faces[i].vertexColors[2] = new THREE.Color(0x0000ff);
    }*/

    var triangleMaterial = new THREE.MeshBasicMaterial({
        map:tex,
        wireframe: true,
        side:THREE.DoubleSide
    });
 
    var loader = new THREE.TextureLoader();
    var tex = loader.load( 'js/pics/grasstile.jpg' );

    var mat = new THREE.MeshLambertMaterial({
        map: tex,
        wireframe: false,
        side: THREE.DoubleSide
    });

    
    var triangleMesh = new THREE.Mesh(geometry, mat);
    triangleMesh.position.set(0.0, 3.0, 0.0);

    scene.add(triangleMesh);
}    

function getPixel( imagedata, x, y )
{
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return data[ position ];;
}
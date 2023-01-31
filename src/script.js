import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
/**
 * Debug
 */
// const gui = new dat.GUI()

// gui
//     .addColor(parameters, 'materialColor')
//     .onChange( () =>{
//         material.color.set(parameters.materialColor)
//     }

//     )

const parameters = {
    materialColor: '#AF7009'
}

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('/textures/gradients/3.jpg')
texture.magFilter = THREE.NearestFilter

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor, 
    gradientMap: texture
})

/**
 * meshes
 */

const objectsDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 32, 64),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 62),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 64),
    material
)

scene.add(
    mesh1, 
    mesh2, 
    mesh3
)

mesh1.position.y = -objectsDistance * 0
mesh2.position.y = -objectsDistance * 1
mesh3.position.y = -objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh1.position.x = 2


const sectionMeshes = [mesh1, mesh2, mesh3]

/**
 * Particles
 */

const particlesCount = 800
const particlesPositions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i++) {
    particlesPositions[i] = (Math.random() - 0.5) * objectsDistance * 4
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
const pointsMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

const particles = new THREE.Points(particlesGeometry, pointsMaterial)

scene.add(particles)


/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1,1,0)

const ambientLight = new THREE.AmbientLight('withe', 0.6)

scene.add(directionalLight, ambientLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)


// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Cursor
 */

const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>{
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = (event.clientY / sizes.height) -  0.5
    console.log(cursor)
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#202B2F')

// Scroll value
let scrollY = window.scrollY
let currentSection = 0
window.addEventListener(
    'scroll', 
    () => {
        scrollY =  window.scrollY
        const newSection = Math.round(scrollY / sizes.height)
        if(newSection != currentSection){
            currentSection = newSection

            gsap.to(sectionMeshes[currentSection  == 3? 2: currentSection].rotation, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=2',
                y: '+=1'
            })
        }
        
    }
)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Delta time
    const deltaTime = elapsedTime -  previousTime
    previousTime = elapsedTime


    camera.position.y =  - scrollY / sizes.height *  objectsDistance *0.6
    const parallaxX = - cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX -  cameraGroup.position.x) * deltaTime  *5
    cameraGroup.position.y += (parallaxY -  cameraGroup.position.y) * deltaTime *5
    
    // Animate meshes
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.11
    }
    
    
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
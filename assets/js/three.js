import * as THREE from '/node_modules/three/build/three.module.js'
import { OrbitControls } from './OrbitControlls.js'
import { OBJLoader } from './OBJLoader.js'
import MouseMeshInteraction from './mmi.js'


const OBJECT_PATH = '/assets/model/'
const OBJECT = "Parachute.obj"
const canvas = document.querySelector('#canvas')

const TRAY = document.getElementById('js-tray-slide')
const type = document.querySelector("#tray__type")

const CAMERA_ZOOM = 600
const BACKGROUND_COLOR = 0xf1f1f1

let model
let selectedType

const colors = [
	{
		color: '66533C'
	},
	{
		color: '173A2F'
	},
	{
		color: '153944'
	},
	{
		color: '27548D'
	},
	{
		color: '438AAC'
	}
]


const scene = new THREE.Scene()

scene.background = new THREE.Color(BACKGROUND_COLOR)

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.z = CAMERA_ZOOM
camera.position.y = 300
camera.position.x = 400

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setClearColor("#fff")
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)


document.body.appendChild(renderer.domElement)

let controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.enableZoom = true
controls.enablePan = true
controls.autoRotate = false


var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61)
hemiLight.position.set(0, 50, 0)
scene.add(hemiLight)

var dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
dirLight.position.set(-8, 12, 8)
dirLight.castShadow = true
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
scene.add(dirLight)


let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0)
keyLight.position.set(-200, 0, 100)
scene.add(keyLight)


const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 })
const INITIAL_MAP = []


const mmi = new MouseMeshInteraction(scene, camera)

let objLoader = new OBJLoader()
objLoader.setPath(OBJECT_PATH)

objLoader.load(OBJECT, function (obj) {


	obj.scale.set(1, 1, 1)
	obj.rotation.y = Math.PI

	for (let object of INITIAL_MAP) {
		initColor(theModel, object.childID, object.mtl)
	}

	model = obj

	scene.add(obj)

	obj.traverse(function (o) {
		if (o.isMesh) {
			INITIAL_MAP.push({ 'childId': o.name, o: INITIAL_MTL })

			type.innerHTML += "<option value='" + o.name + "'>" + o.name.split('_').join(' ') + "</option>"
		}
	})

})


let animate = function () {
	requestAnimationFrame(animate)
	controls.update()
	mmi.update()
	renderer.render(scene, camera)

	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement
		camera.aspect = canvas.clientWidth / canvas.clientHeight
		camera.updateProjectionMatrix()
	}

}

function resizeRendererToDisplaySize (renderer) {
	const canvas = renderer.domElement
	var width = window.innerWidth
	var height = window.innerHeight
	var canvasPixelWidth = canvas.width / window.devicePixelRatio
	var canvasPixelHeight = canvas.height / window.devicePixelRatio

	const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
	if (needResize) {

		renderer.setSize(width, height, false)
	}
	return needResize
}

animate()

function initColor (parent, type, mtl) {
	parent.traverse((o) => {
		if (o.isMesh) {
			if (o.name.includes(type)) {
				o.material = mtl
				o.nameID = type // Set a new property to identify this object
			}
		}
	})
}

// Function - Build Colors
function buildColors (colors) {
	for (let [ i, color ] of colors.entries()) {
		let swatch = document.createElement('div')
		swatch.classList.add('tray__swatch')

		swatch.style.background = "#" + color.color

		swatch.setAttribute('data-key', i)
		TRAY.append(swatch)
	}
}

buildColors(colors)

const swatches = document.querySelectorAll(".tray__swatch")

type.addEventListener('change', function (e) {
	selectedType = e.target.value
})

for (const swatch of swatches) {
	swatch.addEventListener('click', selectSwatch)
}

function selectSwatch (e) {
	let color = colors[ parseInt(e.target.dataset.key) ]
	let new_mtl

	new_mtl = new THREE.MeshPhongMaterial({
		color: parseInt('0x' + color.color),
		shininess: color.shininess ? color.shininess : 10

	})

	setMaterial(model, selectedType, new_mtl)
}


function setMaterial (parent, type, mtl) {

	parent.traverse((o) => {
		if (o.isMesh && o.name != null) {
			if (o.name == type) {
				o.material = mtl
			}
		}
	})
}

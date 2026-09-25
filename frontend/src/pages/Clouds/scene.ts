import {
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene as ThreeScene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type BufferGeometry,
  type Texture,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import cloudTextureUrl from './cloud10.png'

export interface SceneOptions {
  reducedMotion: boolean
}

const FOG_COLOR = 0x4584b4
const FOG_NEAR = -100
const FOG_FAR = 3000
const LOOP_DEPTH = 8000
const BASE_PLANE_COUNT = 8000
const MOBILE_PLANE_COUNT = 4000

const CLOUD_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const CLOUD_FRAGMENT_SHADER = `
  uniform sampler2D map;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec2 vUv;

  void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep( fogNear, fogFar, depth );

    gl_FragColor = texture2D( map, vUv );
    gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
  }
`

/**
 * Endless flight through soft clouds, ported from "Live clouds" by
 * DenDionigi (codepen.io/DenDionigi/pen/GRbGLgy, MIT), itself built on
 * mrdoob's classic WebGL clouds demo, which also provides the cloud10.png
 * sprite. Thousands of randomly placed textured planes are merged into one
 * geometry; a second copy of the merged mesh sits one loop-depth behind so
 * the camera's looping z-flight never runs out of sky. A custom fog shader
 * fades the far planes into the page's blue gradient. Pointer movement
 * (mouse or touch drag) eases the camera sideways for parallax. Frame times
 * are sampled and the plane count halves (at most twice) if the device
 * can't keep up.
 */
export class Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly renderer: WebGLRenderer
  private readonly scene: ThreeScene
  private readonly camera: PerspectiveCamera
  private reducedMotion: boolean

  private material: ShaderMaterial | null = null
  private texture: Texture | null = null
  private geometry: BufferGeometry | null = null
  private meshNear: Mesh | null = null
  private meshFar: Mesh | null = null

  private w = 0
  private h = 0
  private raf = 0
  private running = false
  private destroyed = false
  private lastNow = 0
  private time = 0

  private targetX = 0
  private targetY = 0

  private planeCount: number
  private frameAccum = 0
  private frameSamples = 0
  private adaptLevel = 0

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.canvas = canvas
    this.reducedMotion = opts.reducedMotion
    this.planeCount =
      Math.min(window.screen.width, window.screen.height) < 768
        ? MOBILE_PLANE_COUNT
        : BASE_PLANE_COUNT

    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true })
    this.renderer.setClearColor(0x000000, 0) // page gradient shows through

    this.scene = new ThreeScene()
    this.camera = new PerspectiveCamera(30, 1, 1, FOG_FAR)
    this.camera.position.z = LOOP_DEPTH

    new TextureLoader().load(cloudTextureUrl, (texture) => {
      if (this.destroyed) {
        texture.dispose()
        return
      }
      texture.colorSpace = SRGBColorSpace
      texture.magFilter = LinearFilter
      texture.minFilter = LinearMipmapLinearFilter
      this.texture = texture
      this.material = new ShaderMaterial({
        uniforms: {
          map: { value: texture },
          fogColor: { value: new Color(FOG_COLOR) },
          fogNear: { value: FOG_NEAR },
          fogFar: { value: FOG_FAR },
        },
        vertexShader: CLOUD_VERTEX_SHADER,
        fragmentShader: CLOUD_FRAGMENT_SHADER,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      })
      this.buildField()
      if (!this.running) this.renderStill()
    })
  }

  setReducedMotion(reduced: boolean): void {
    if (this.reducedMotion === reduced) return
    this.reducedMotion = reduced
    this.stop()
    this.start()
  }

  setPointer(clientX: number, clientY: number): void {
    if (this.w === 0) return
    this.targetX = (clientX - this.w / 2) * 0.25
    this.targetY = (clientY - this.h / 2) * 0.15
  }

  resize(): void {
    const cssW = this.canvas.clientWidth
    const cssH = this.canvas.clientHeight
    if (cssW === 0 || cssH === 0) return
    this.w = cssW
    this.h = cssH
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(cssW, cssH, false) // CSS owns the layout size
    this.camera.aspect = cssW / cssH
    this.camera.updateProjectionMatrix()

    this.frameAccum = 0
    this.frameSamples = 0

    if (!this.running) this.renderStill()
  }

  start(): void {
    if (this.w === 0) return
    if (this.reducedMotion) {
      this.running = false
      this.renderStill()
      return
    }
    if (this.running) return
    this.running = true
    this.lastNow = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  destroy(): void {
    this.destroyed = true
    this.stop()
    this.disposeField()
    this.material?.dispose()
    this.texture?.dispose()
    // No forceContextLoss here: StrictMode remounts reuse the same canvas,
    // and a force-lost context would break the next renderer on it.
    this.renderer.dispose()
  }

  /** Static frame from mid-flight; the fog still gives it depth. */
  private renderStill(): void {
    this.camera.position.set(0, 0, LOOP_DEPTH * 0.625)
    this.renderer.render(this.scene, this.camera)
  }

  private frame = (now: number): void => {
    if (!this.running) return
    const dt = Math.min((now - this.lastNow) / 1000, 0.05)
    this.lastNow = now
    this.time += dt

    const position = (this.time * 1000 * 0.03) % LOOP_DEPTH
    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.01
    this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.01
    this.camera.position.z = LOOP_DEPTH - position
    this.renderer.render(this.scene, this.camera)

    // Adaptive quality: sample a second of frames, degrade if slow.
    if (this.adaptLevel < 2 && this.meshNear) {
      this.frameAccum += dt
      this.frameSamples++
      if (this.frameSamples === 60) {
        if (this.frameAccum / 60 > 0.022) {
          this.adaptLevel++
          this.planeCount = Math.floor(this.planeCount / 2)
          this.buildField()
        }
        this.frameAccum = 0
        this.frameSamples = 0
      }
    }

    this.raf = requestAnimationFrame(this.frame)
  }

  /** (Re)build the merged cloud field at the current plane count. */
  private buildField(): void {
    if (!this.material) return
    this.disposeField()

    const planeGeo = new PlaneGeometry(64, 64)
    const placer = new Object3D()
    const geometries: BufferGeometry[] = []
    for (let i = 0; i < this.planeCount; i++) {
      placer.position.x = Math.random() * 1000 - 500
      placer.position.y = -Math.random() * Math.random() * 200 - 15
      // Spread over the full loop depth so reduced counts keep the same span.
      placer.position.z = (i / this.planeCount) * LOOP_DEPTH
      placer.rotation.z = Math.random() * Math.PI
      placer.scale.x = placer.scale.y = Math.random() * Math.random() * 1.5 + 0.5
      placer.updateMatrix()

      const cloned = planeGeo.clone()
      cloned.applyMatrix4(placer.matrix)
      geometries.push(cloned)
    }
    planeGeo.dispose()

    this.geometry = mergeGeometries(geometries)
    this.meshNear = new Mesh(this.geometry, this.material)
    this.meshNear.renderOrder = 2
    this.meshFar = this.meshNear.clone()
    this.meshFar.position.z = -LOOP_DEPTH
    this.meshFar.renderOrder = 1
    this.scene.add(this.meshNear)
    this.scene.add(this.meshFar)
  }

  private disposeField(): void {
    if (this.meshNear) this.scene.remove(this.meshNear)
    if (this.meshFar) this.scene.remove(this.meshFar)
    this.geometry?.dispose() // shared by both meshes
    this.meshNear = null
    this.meshFar = null
    this.geometry = null
  }
}

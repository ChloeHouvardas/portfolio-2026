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
const BASE_FOV = 30

// Idle drift speed in world units/sec; flights multiply it up to the peak.
const IDLE_SPEED = 30
const FLIGHT_PEAK = 24
const FLIGHT_MS = 2000

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

interface Flight {
  elapsed: number
  duration: number
  resolve: (completed: boolean) => void
}

/**
 * Cloud-flight backdrop for the portfolio home page. Same technique as the
 * /clouds scene (a port of "Live clouds" by DenDionigi,
 * codepen.io/DenDionigi/pen/GRbGLgy, MIT, after mrdoob's classic WebGL
 * clouds demo, which also provides the cloud10.png sprite): thousands of
 * randomly placed textured planes merged into one geometry, duplicated one
 * loop-depth back, faded by a custom fog shader, with eased pointer
 * parallax and adaptive plane-count quality.
 *
 * On top of that, this copy adds fly(): a whoosh that multiplies the drift
 * speed along a sine ease (and widens the FOV) for the page's
 * fly-to-section transitions. Camera travel integrates distance from
 * per-frame dt instead of deriving it from absolute time, so speed changes
 * never teleport the camera and a hidden tab pauses mid-flight cleanly.
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
  private distance = 0
  private flight: Flight | null = null

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
    this.camera = new PerspectiveCamera(BASE_FOV, 1, 1, FOG_FAR)
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

  /**
   * Whoosh forward through the clouds, then settle back to idle drift.
   * Resolves true on arrival, false when superseded by a newer flight or
   * destroyed. With reduced motion it resolves true immediately so the
   * caller can crossfade instead.
   */
  fly(durationMs = FLIGHT_MS): Promise<boolean> {
    if (this.reducedMotion || this.destroyed) return Promise.resolve(true)
    this.flight?.resolve(false)
    return new Promise((resolve) => {
      this.flight = { elapsed: 0, duration: durationMs, resolve }
    })
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
    this.flight?.resolve(false)
    this.flight = null
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

    let mult = 1
    let fov = BASE_FOV
    if (this.flight) {
      this.flight.elapsed += dt * 1000
      const p = Math.min(this.flight.elapsed / this.flight.duration, 1)
      const ease = Math.sin(p * Math.PI) // 0 → peak → 0, lands at idle speed
      mult = 1 + FLIGHT_PEAK * ease
      fov = BASE_FOV + 8 * ease
      if (p === 1) {
        this.flight.resolve(true)
        this.flight = null
      }
    }
    if (fov !== this.camera.fov) {
      this.camera.fov = fov
      this.camera.updateProjectionMatrix()
    }

    this.distance += dt * IDLE_SPEED * mult
    const position = this.distance % LOOP_DEPTH
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

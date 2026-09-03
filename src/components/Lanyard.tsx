// Physics structure adapted from React Bits' Lanyard component.
// Copyright (c) 2026 David Haz — MIT + Commons Clause License Condition v1.0.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
    type RapierRigidBody,
    type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import cardModel from "../assets/lanyard-card.glb?url";
import lanyardTexture from "../assets/lanyard-weave.png?url";
import portrait from "../assets/blaz-lanyard-cutout.png?url";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
    interface ThreeElements {
        meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
        meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
    }
}

interface LanyardProps {
    cameraDistance?: number;
    gravity?: [number, number, number];
}

type CardModel = {
    nodes: {
        card: THREE.Mesh;
        clip: THREE.Mesh;
        clamp: THREE.Mesh;
    };
    materials: {
        base: THREE.MeshPhysicalMaterial & { map: THREE.Texture };
        metal: THREE.MeshStandardMaterial;
    };
};

type LanyardBody = RapierRigidBody & { lerped?: THREE.Vector3 };

const FRONT_UV_RECT = { x: 0, y: 0, width: 0.5, height: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, width: 0.5, height: 0.757 };

const HOLOGRAM_VERTEX_SHADER = `
    varying vec2 vUv;
    varying vec3 vNormalView;
    varying vec3 vViewDirection;

    void main() {
        vUv = uv;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const HOLOGRAM_FRAGMENT_SHADER = `
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormalView;
    varying vec3 vViewDirection;

    void main() {
        float sweepPosition = fract(vUv.x * 0.58 + vUv.y * 0.7 + uTime * 0.035);
        float sweep = pow(max(0.0, 1.0 - abs(sweepPosition - 0.5) * 7.5), 3.0);
        float scan = pow(0.5 + 0.5 * sin((vUv.y * 44.0 - uTime * 0.7) * 3.14159), 10.0);
        float fresnel = pow(1.0 - max(dot(vNormalView, vViewDirection), 0.0), 2.2);
        vec3 spectrum = 0.5 + 0.5 * cos(
            6.28318 * (sweepPosition + vec3(0.0, 0.34, 0.68))
        );
        vec3 tint = mix(vec3(0.22, 0.42, 0.9), spectrum, 0.66);
        float alpha = (sweep * 0.11 + fresnel * 0.075 + scan * 0.018) * uIntensity;
        gl_FragColor = vec4(tint, alpha);
    }
`;

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number) {
    let size = startSize;
    do {
        context.font = `700 ${size}px Arial, sans-serif`;
        size -= 2;
    } while (context.measureText(text).width > maxWidth && size > 32);
}

function drawBadgeArtwork(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    context.save();
    context.beginPath();
    context.rect(x, y, width, height);
    context.clip();

    const background = context.createLinearGradient(x, y, x + width, y + height);
    background.addColorStop(0, "#11172f");
    background.addColorStop(0.54, "#101a35");
    background.addColorStop(1, "#061629");
    context.fillStyle = background;
    context.fillRect(x, y, width, height);

    context.strokeStyle = "rgba(104, 126, 209, 0.22)";
    context.lineWidth = Math.max(2, width * 0.003);
    const trace = (points: Array<[number, number]>) => {
        context.beginPath();
        points.forEach(([px, py], index) => {
            const tx = x + px * width;
            const ty = y + py * height;
            if (index === 0) context.moveTo(tx, ty);
            else context.lineTo(tx, ty);
        });
        context.stroke();
        points.forEach(([px, py]) => {
            context.beginPath();
            context.arc(x + px * width, y + py * height, width * 0.007, 0, Math.PI * 2);
            context.fillStyle = "rgba(122, 144, 226, 0.3)";
            context.fill();
        });
    };
    trace([
        [0.08, 0.33],
        [0.17, 0.33],
        [0.21, 0.29],
        [0.29, 0.29],
    ]);
    trace([
        [0.71, 0.34],
        [0.8, 0.34],
        [0.84, 0.3],
        [0.94, 0.3],
    ]);
    trace([
        [0.76, 0.44],
        [0.86, 0.44],
        [0.91, 0.4],
        [0.96, 0.4],
    ]);

    context.fillStyle = "rgba(224, 229, 255, 0.92)";
    fitText(context, "BLAŽ PERIĆ", width * 0.84, width * 0.105);
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText("BLAŽ PERIĆ", x + width / 2, y + height * 0.085);

    context.font = `600 ${Math.round(width * 0.026)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(188, 201, 245, 0.86)";
    context.letterSpacing = `${Math.round(width * 0.004)}px`;
    context.fillText("FULL-STACK DEVELOPER · AI / LLM", x + width / 2, y + height * 0.168);
    context.letterSpacing = "0px";

    const source = image as HTMLImageElement;
    const cropTop = source.naturalHeight * 0.115;
    const sourceHeight = source.naturalHeight - cropTop;
    const targetWidth = width * 1.04;
    const scale = targetWidth / source.naturalWidth;
    const targetHeight = sourceHeight * scale;
    context.globalAlpha = 0.98;
    context.drawImage(
        source,
        0,
        cropTop,
        source.naturalWidth,
        sourceHeight,
        x - width * 0.02,
        y + height - targetHeight,
        targetWidth,
        targetHeight,
    );

    const portraitFade = context.createLinearGradient(x, y + height * 0.68, x, y + height);
    portraitFade.addColorStop(0, "rgba(5, 16, 34, 0)");
    portraitFade.addColorStop(1, "rgba(5, 16, 34, 0.46)");
    context.fillStyle = portraitFade;
    context.fillRect(x, y + height * 0.66, width, height * 0.34);

    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.font = `600 ${Math.round(width * 0.024)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(222, 230, 255, 0.8)";
    context.fillText("MOSTAR / BIH", x + width * 0.06, y + height * 0.955);
    context.textAlign = "right";
    context.fillText("BP—04", x + width * 0.94, y + height * 0.955);

    context.restore();
}

function drawBadgeBack(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    context.save();
    context.beginPath();
    context.rect(x, y, width, height);
    context.clip();

    const background = context.createLinearGradient(x, y, x + width, y + height);
    background.addColorStop(0, "#11172f");
    background.addColorStop(0.55, "#0c1831");
    background.addColorStop(1, "#061629");
    context.fillStyle = background;
    context.fillRect(x, y, width, height);

    context.strokeStyle = "rgba(117, 144, 226, 0.18)";
    context.lineWidth = Math.max(2, width * 0.003);
    for (let index = -3; index < 8; index += 1) {
        context.beginPath();
        context.moveTo(x + width * (index * 0.18), y);
        context.lineTo(x + width * (index * 0.18 + 0.72), y + height);
        context.stroke();
    }

    context.textAlign = "left";
    context.textBaseline = "top";
    context.font = `600 ${Math.round(width * 0.024)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(191, 207, 249, 0.64)";
    context.fillText("BP—04 / REVERSE", x + width * 0.07, y + height * 0.07);

    const lines = ["HOW DID YOU", "MANAGE TO", "DO THAT????"];
    context.textAlign = "center";
    context.fillStyle = "rgba(230, 235, 255, 0.94)";
    lines.forEach((line, index) => {
        fitText(context, line, width * 0.84, width * 0.105);
        context.fillText(line, x + width / 2, y + height * (0.28 + index * 0.115));
    });

    context.strokeStyle = "rgba(135, 165, 238, 0.42)";
    context.lineWidth = Math.max(2, width * 0.003);
    context.beginPath();
    context.moveTo(x + width * 0.16, y + height * 0.7);
    context.lineTo(x + width * 0.84, y + height * 0.7);
    context.stroke();

    context.font = `600 ${Math.round(width * 0.025)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(197, 211, 247, 0.72)";
    context.fillText("BLAZPERIC.COM", x + width / 2, y + height * 0.755);

    context.font = `500 ${Math.round(width * 0.019)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(154, 175, 226, 0.54)";
    context.fillText("REACT · .NET · FLUTTER · AI", x + width / 2, y + height * 0.91);
    context.restore();
}

export default function Lanyard({
    cameraDistance = 22,
    gravity = [0, -40, 0],
}: LanyardProps) {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" && window.innerWidth < 768,
    );
    const [reduceMotion, setReduceMotion] = useState(() =>
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleMotionChange = () => setReduceMotion(motionQuery.matches);
        window.addEventListener("resize", handleResize);
        motionQuery.addEventListener("change", handleMotionChange);
        return () => {
            window.removeEventListener("resize", handleResize);
            motionQuery.removeEventListener("change", handleMotionChange);
        };
    }, []);

    return (
        <div
            className="lanyard-wrapper"
            role="img"
            aria-label="Interactive lanyard with Blaž Perić’s developer badge"
        >
            <Canvas
                camera={{ position: [0, 0, cameraDistance], fov: 11 }}
                dpr={[1, isMobile ? 1.35 : 1.8]}
                gl={{ alpha: true, antialias: true }}
                onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
            >
                <ambientLight intensity={Math.PI * 0.75} />
                <Physics
                    gravity={reduceMotion ? [0, 0, 0] : gravity}
                    timeStep={isMobile ? 1 / 30 : 1 / 60}
                >
                    <Band isMobile={isMobile} interactive={!reduceMotion} />
                </Physics>
                <Environment blur={0.72}>
                    <Lightformer
                        intensity={2.5}
                        color="#dce8ff"
                        position={[0, -1, 5]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={4}
                        color="#8db8ff"
                        position={[-2, 1, 2]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[80, 0.15, 1]}
                    />
                    <Lightformer
                        intensity={5}
                        color="#d9c8ff"
                        position={[3, -1, 3]}
                        rotation={[0, Math.PI / 2, Math.PI / 3]}
                        scale={[80, 8, 1]}
                    />
                </Environment>
            </Canvas>
        </div>
    );
}

interface BandProps {
    isMobile: boolean;
    interactive: boolean;
    maxSpeed?: number;
    minSpeed?: number;
}

function Band({ isMobile, interactive, maxSpeed = 50, minSpeed = 0 }: BandProps) {
    const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
    const fixed = useRef<RapierRigidBody>(null!);
    const jointOne = useRef<LanyardBody>(null!);
    const jointTwo = useRef<LanyardBody>(null!);
    const jointThree = useRef<RapierRigidBody>(null!);
    const card = useRef<RapierRigidBody>(null!);

    const vector = useMemo(() => new THREE.Vector3(), []);
    const angularVelocity = useMemo(() => new THREE.Vector3(), []);
    const rotation = useMemo(() => new THREE.Vector3(), []);
    const direction = useMemo(() => new THREE.Vector3(), []);
    const { nodes, materials } = useGLTF(cardModel) as unknown as CardModel;
    const weave = useTexture(lanyardTexture);
    const bandTexture = useMemo(() => {
        const texture = weave.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        return texture;
    }, [weave]);
    const portraitTexture = useTexture(portrait);
    const physicalMaterial = useRef<THREE.MeshPhysicalMaterial>(null!);
    const hologramMaterial = useRef<THREE.ShaderMaterial>(null!);
    const [curve] = useState(() => {
        const ropeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
        ]);
        ropeCurve.curveType = "chordal";
        return ropeCurve;
    });
    const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
    const [hovered, setHovered] = useState(false);

    const segmentProps: RigidBodyProps = {
        type: "dynamic",
        canSleep: true,
        colliders: false,
        angularDamping: 4,
        linearDamping: 4,
    };

    const cardMap = useMemo(() => {
        const baseMap = materials.base.map;
        const baseImage = baseMap.image as HTMLImageElement;
        const canvas = document.createElement("canvas");
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        const context = canvas.getContext("2d");
        if (!context) return baseMap;

        context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        drawBadgeArtwork(
            context,
            portraitTexture.image as HTMLImageElement,
            FRONT_UV_RECT.x * canvas.width,
            FRONT_UV_RECT.y * canvas.height,
            FRONT_UV_RECT.width * canvas.width,
            FRONT_UV_RECT.height * canvas.height,
        );
        drawBadgeBack(
            context,
            BACK_UV_RECT.x * canvas.width,
            BACK_UV_RECT.y * canvas.height,
            BACK_UV_RECT.width * canvas.width,
            BACK_UV_RECT.height * canvas.height,
        );

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = baseMap.flipY;
        texture.anisotropy = 16;
        texture.needsUpdate = true;
        return texture;
    }, [materials.base.map, portraitTexture.image]);

    useEffect(() => {
        return () => {
            bandTexture.dispose();
            if (cardMap !== materials.base.map) cardMap.dispose();
        };
    }, [bandTexture, cardMap, materials.base.map]);

    useRopeJoint(fixed, jointOne, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(jointOne, jointTwo, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(jointTwo, jointThree, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(jointThree, card, [[0, 0, 0], [0, 1.45, 0]]);

    useEffect(() => {
        if (!hovered) return;
        document.body.style.cursor = dragged ? "grabbing" : "grab";
        return () => {
            document.body.style.cursor = "auto";
        };
    }, [dragged, hovered]);

    const getLerped = (body: LanyardBody) => {
        if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
        return body.lerped;
    };

    useFrame((state, delta) => {
        if (dragged) {
            vector.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            direction.copy(vector).sub(state.camera.position).normalize();
            vector.add(direction.multiplyScalar(state.camera.position.length()));
            [card, jointOne, jointTwo, jointThree, fixed].forEach((body) => body.current?.wakeUp());
            card.current?.setNextKinematicTranslation({
                x: vector.x - dragged.x,
                y: vector.y - dragged.y,
                z: vector.z - dragged.z,
            });
        }

        if (!fixed.current) return;
        [jointOne, jointTwo].forEach((body) => {
            const lerped = getLerped(body.current);
            const distance = Math.max(0.1, Math.min(1, lerped.distanceTo(body.current.translation())));
            lerped.lerp(body.current.translation(), delta * (minSpeed + distance * (maxSpeed - minSpeed)));
        });
        curve.points[0].copy(jointThree.current.translation());
        curve.points[1].copy(getLerped(jointTwo.current));
        curve.points[2].copy(getLerped(jointOne.current));
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 18 : 32));
        angularVelocity.copy(card.current.angvel());
        rotation.copy(card.current.rotation());
        card.current.setAngvel(
            { x: angularVelocity.x, y: angularVelocity.y - rotation.y * 0.25, z: angularVelocity.z },
            true,
        );

        if (physicalMaterial.current) {
            physicalMaterial.current.iridescence = THREE.MathUtils.lerp(
                physicalMaterial.current.iridescence,
                hovered ? 0.92 : 0.58,
                1 - Math.exp(-delta * 5),
            );
        }
        if (hologramMaterial.current) {
            hologramMaterial.current.uniforms.uTime.value = state.clock.elapsedTime;
            hologramMaterial.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
                hologramMaterial.current.uniforms.uIntensity.value,
                hovered ? 1 : 0.62,
                1 - Math.exp(-delta * 6),
            );
        }
    });

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type="fixed" />
                <RigidBody position={[0.5, 0, 0]} ref={jointOne} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={jointTwo} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={jointThree} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? "kinematicPosition" : "dynamic"}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => interactive && setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onPointerUp={(event: ThreeEvent<PointerEvent>) => {
                            (event.target as Element).releasePointerCapture(event.pointerId);
                            setDragged(false);
                        }}
                        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
                            if (!interactive) return;
                            (event.target as Element).setPointerCapture(event.pointerId);
                            setDragged(
                                new THREE.Vector3().copy(event.point).sub(vector.copy(card.current.translation())),
                            );
                        }}
                    >
                        <mesh geometry={nodes.card.geometry}>
                            <meshPhysicalMaterial
                                ref={physicalMaterial}
                                map={cardMap}
                                map-anisotropy={16}
                                clearcoat={isMobile ? 0.55 : 1}
                                clearcoatRoughness={0.12}
                                roughness={0.42}
                                metalness={0.28}
                                iridescence={0.58}
                                iridescenceIOR={1.42}
                                iridescenceThicknessRange={[110, 720]}
                            />
                        </mesh>
                        <mesh geometry={nodes.card.geometry} renderOrder={2} scale={1.002}>
                            <shaderMaterial
                                ref={hologramMaterial}
                                vertexShader={HOLOGRAM_VERTEX_SHADER}
                                fragmentShader={HOLOGRAM_FRAGMENT_SHADER}
                                uniforms={{
                                    uTime: { value: 0 },
                                    uIntensity: { value: 0.62 },
                                }}
                                transparent
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                                polygonOffset
                                polygonOffsetFactor={-1}
                                toneMapped={false}
                            />
                        </mesh>
                        <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.28} />
                        <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial
                    args={[
                        {
                            resolution: new THREE.Vector2(
                                isMobile ? 800 : 1000,
                                isMobile ? 1400 : 1000,
                            ),
                        },
                    ]}
                    color="#b9c9f5"
                    depthTest={false}
                    resolution={isMobile ? [800, 1400] : [1000, 1000]}
                    useMap={1}
                    map={bandTexture}
                    repeat={[-4, 1]}
                    lineWidth={0.88}
                />
            </mesh>
        </>
    );
}

useGLTF.preload(cardModel);

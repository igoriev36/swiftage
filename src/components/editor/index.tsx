import { inject, observer, Provider } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { animationFrameScheduler, fromEvent, merge } from "rxjs";
import {
  concatAll,
  distinctUntilChanged,
  filter,
  map,
  scan,
  share,
  startWith,
  takeUntil,
  throttleTime
} from "rxjs/operators";
import * as THREE from "three";
import "three-orbit-controls";
import { IProject } from "../../models/project";
import ArrowHelper from "./arrow_helper";
import Grid from "./grid";
import Hanger from "./hanger";

interface IEditor {
  project: IProject;
  bgColor: number;
}

class Editor extends React.Component<IEditor> {
  private camera;
  private orbitControls: THREE.OrbitControls;
  private container: HTMLDivElement;
  private raycaster = new THREE.Raycaster();
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private scene = new THREE.Scene();
  private streams: any = {};

  constructor(props) {
    super(props);
    this.render3d = this.render3d.bind(this);
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    const { domElement } = this.renderer;

    this.renderer.setClearColor(this.props.bgColor);

    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.set(-30, 100, 70);
    this.camera.lookAt(0, 0, 0);

    this.container.appendChild(domElement);

    // add orbit controls
    this.orbitControls = new THREE.OrbitControls(this.camera, domElement);
    this.orbitControls.enableZoom = true;
    this.orbitControls.enableDamping = true;
    this.orbitControls.minDistance = 4;
    this.orbitControls.maxDistance = 200;
    this.orbitControls.dampingFactor = 0.25;
    this.orbitControls.rotateSpeed = 0.4;
    (this.orbitControls as any).panSpeed = 0.2;
    this.orbitControls.minPolarAngle = 0.1;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.15;

    var geometry = new THREE.PlaneBufferGeometry(80, 80);
    geometry.rotateX(-Math.PI / 2);
    const plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: "green" })
      // new THREE.ShadowMaterial({ opacity: 1 })
    );
    this.scene.add(plane);

    // setup streams
    this.streams.mouseDown$ = fromEvent(domElement, "mousedown");

    this.streams.mouseUp$ = fromEvent(domElement, "mouseup");

    this.streams.wheel$ = fromEvent(domElement, "wheel").pipe(share());

    this.streams.mouseMove$ = fromEvent(domElement, "mousemove").pipe(
      throttleTime(0, animationFrameScheduler),
      share()
    );

    const xy$ = merge(this.streams.mouseMove$, this.streams.wheel$).pipe(
      scan(
        (acc, event: MouseEvent) => {
          // acc.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
          // acc.y =
          //   (event.clientY / this.renderer.domElement.clientHeight) * 2 - 1;
          acc.x = (event.layerX / 500) * 2 - 1;
          acc.y = (event.layerY / 500) * 2 - 1;

          // vector.set(acc.x, acc.y, this.camera.near);
          return acc;
        },
        { x: 0, y: 0 }
      )
    );

    const intersection$ = xy$.pipe(
      map(xy => {
        this.raycaster.setFromCamera(xy, this.camera);
        return this.raycaster.intersectObject(plane).length > 0
          ? this.raycaster.intersectObject(plane)[0]
          : null;
      })
    );

    const xyz$ = intersection$.pipe(
      filter(Boolean),
      map(i => {
        const {
          point: { x, y, z }
        } = i as any;
        return [
          Math.floor(x / 3),
          // Math.abs(Math.floor(y / 3)),
          0,
          Math.floor(z / 3) + 1
        ];
      }),
      distinctUntilChanged((a, b) => a.toString() === b.toString())
    );
    xyz$.subscribe(console.log);

    this.streams.mouseDrag$ = this.streams.mouseDown$.pipe(
      map(() => this.streams.mouseMove$.pipe(takeUntil(this.streams.mouseUp$))),
      concatAll()
    );

    this.streams.render$ = merge(
      this.streams.mouseDrag$,
      this.streams.wheel$
    ).pipe(
      startWith(null),
      throttleTime(0, animationFrameScheduler)
    );

    this.streams.render$.subscribe(this.animate);

    this.handleResize();
  }

  componentWillUnmount() {
    Object.keys(this.streams).forEach(key => {
      this.streams[key].unsubscribe();
    });
  }

  handleResize(event = null) {
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.render3d();
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }

  render3d() {
    // console.log("render");
    requestAnimationFrame(this.animate);
  }

  render() {
    return (
      <Provider scene={this.scene}>
        <div
          ref={e => (this.container = e)}
          style={{ width: 500, height: 500 }}
        >
          <Grid />
          <ArrowHelper />
          <Hanger />
        </div>
      </Provider>
    );
  }
}

export default compose<any, { bgColor: number }>(
  inject("project"),
  observer
)(Editor);

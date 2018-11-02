import { reaction } from "mobx";
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
import Entity from "./entity";
import Grid from "./grid";

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
  private sceneActions: any;
  private streams: any = {};
  private objectsToRaycast = [];

  constructor(props) {
    super(props);
    this.add = this.add.bind(this);
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.remove = this.remove.bind(this);
    this.render3d = this.render3d.bind(this);
    this.sceneActions = {
      add: this.add,
      remove: this.remove,
      render: this.render3d
    };
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
    this.orbitControls.enableKeys = false;
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
      new THREE.MeshBasicMaterial({ color: "green", visible: false })
      // new THREE.ShadowMaterial({ opacity: 1 })
    );
    this.scene.add(plane);
    this.objectsToRaycast = [plane];

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

    // const hanger = new THREE.Mesh(
    //   new THREE.BoxGeometry(6, 6, 6),
    //   new THREE.MeshNormalMaterial()
    // );
    // hanger.translateY(3);
    // this.scene.add(hanger);

    const intersection$ = xy$.pipe(
      map(xy => {
        this.raycaster.setFromCamera(xy, this.camera);
        if (this.props.project.tool === "ORBIT") {
          return this.raycaster.intersectObject(plane).length > 0
            ? this.raycaster.intersectObject(plane)[0]
            : null;
        } else {
          // return this.raycaster.intersectObject(hanger).length > 0
          //   ? this.raycaster.intersectObject(hanger)[0]
          //   : null;
          return null;
        }
      }),
      distinctUntilChanged()
    );

    const extrudeNormals$ = intersection$.pipe(
      filter(Boolean),
      map(i => i.face.normal),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );

    extrudeNormals$.subscribe(console.log);

    // const xyz$ = intersection$.pipe(
    //   filter(Boolean),
    //   map(i => {
    //     const {
    //       point: { x, y, z }
    //     } = i as any;
    //     return [
    //       Math.floor(x / 3),
    //       // Math.abs(Math.floor(y / 3)),
    //       0,
    //       Math.floor(z / 3) + 1
    //     ];
    //   }),
    //   distinctUntilChanged((a, b) => a.toString() === b.toString())
    // );
    // xyz$.subscribe(console.log);

    reaction(
      () => this.props.project.tool,
      tool => {
        switch (tool) {
          case "ORBIT":
            this.orbitControls.enabled = true;
            break;
          default:
            this.orbitControls.enabled = false;
            break;
        }
      }
    );

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
    // Object.keys(this.streams).forEach(key => {
    //   this.streams[key].unsubscribe();
    // });
  }

  handleResize(event = null) {
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.render3d();
  }

  add(thing) {
    this.scene.add(thing);
    this.render3d();
  }

  remove(thing) {
    this.scene.remove(thing);
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
      <Provider scene={this.sceneActions}>
        <div
          ref={e => (this.container = e)}
          style={{ width: 500, height: 500 }}
        >
          <Grid />
          <ArrowHelper />
          {/* <Hanger /> */}
          {this.props.project.entities.map(entity => (
            <Entity key={entity.id} entity={entity} />
          ))}
        </div>
      </Provider>
    );
  }
}

export default compose<any, { bgColor: number }>(
  inject("project"),
  observer
)(Editor);

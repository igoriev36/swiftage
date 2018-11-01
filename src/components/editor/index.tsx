import { inject, observer, Provider } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import { fromEvent, merge } from "rxjs";
import {
  concatAll,
  map,
  share,
  startWith,
  takeUntil,
  throttleTime
} from "rxjs/operators";
import * as THREE from "three";
import "three-orbit-controls";
import { IProject } from "../../models/project";
import Grid from "./grid";

interface IEditor {
  project: IProject;
  bgColor: number;
}

class Editor extends React.Component<IEditor> {
  private camera;
  private orbitControls: THREE.OrbitControls;
  private container: HTMLDivElement;
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
    this.camera.lookAt(0, 1, 0);

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

    // setup streams
    this.streams.mouseDown$ = fromEvent(domElement, "mousedown");

    this.streams.mouseUp$ = fromEvent(domElement, "mouseup");

    this.streams.mouseMove$ = fromEvent(domElement, "mousemove").pipe(
      throttleTime(10),
      share()
    );

    this.streams.mouseDrag$ = this.streams.mouseDown$.pipe(
      map(() => this.streams.mouseMove$.pipe(takeUntil(this.streams.mouseUp$))),
      concatAll()
    );

    this.streams.render$ = merge(this.streams.mouseDrag$).pipe(
      startWith(null),
      throttleTime(20)
    );

    this.streams.render$.subscribe(this.render3d);

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
    console.log("render");
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
        </div>
      </Provider>
    );
  }
}

export default compose<any, { bgColor: number }>(
  inject("project"),
  observer
)(Editor);

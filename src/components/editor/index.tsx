import { inject, observer } from "mobx-react";
import * as React from "react";
import { compose } from "recompose";
import * as THREE from "three";
import { IProject } from "../../models/project";

interface IEditor {
  project: IProject;
  bgColor: number;
}

class Editor extends React.Component<IEditor> {
  private camera;
  private container: HTMLDivElement;
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private scene = new THREE.Scene();

  constructor(props) {
    super(props);
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    this.renderer.setClearColor(this.props.bgColor);

    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.set(-30, 100, 70);
    this.camera.lookAt(0, 1, 0);

    this.container.appendChild(this.renderer.domElement);

    this.handleResize();
  }

  handleResize(event = null) {
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    requestAnimationFrame(this.animate);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={e => (this.container = e)}
        style={{ width: 500, height: 500 }}
      />
    );
  }
}

export default compose<any, { bgColor: number }>(
  inject("project"),
  observer
)(Editor);

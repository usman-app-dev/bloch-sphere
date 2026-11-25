# Bloch Sphere

An interactive 3D visualiser for a single qubit. Prepare a state, apply quantum gates, and watch the state vector rotate around the Bloch sphere while the panel shows the amplitudes, angles and measurement probabilities.

Built with TypeScript and Three.js. The quantum maths is written from scratch, with no physics libraries.

## Features

- **Gates**: Pauli X, Y, Z and Hadamard
- **Rotations by any angle**: Rx(θ), Ry(θ) and Rz(θ) for θ from −360° to 360°, set with a slider or typed in
- **State preparation**: the six cardinal states |0⟩, |1⟩, |+⟩, |−⟩, |+i⟩ and |−i⟩
- **Animated gates**: each gate plays as a continuous rotation about its own axis, so you see the path the state actually takes, not just where it ends up
- **Trail**: the arcs the state has travelled stay drawn on the sphere until cleared
- **Live state readout**: |ψ⟩ = α|0⟩ + β|1⟩, the angles θ and φ, the Bloch vector length, and P(0) and P(1) as bars
- **Undo and Reset**
- **Orbit controls**: drag to rotate the view, scroll to zoom

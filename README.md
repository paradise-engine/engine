<div align="center">
    <img width="200" height="200" src="https://raw.githubusercontent.com/paradise-engine/engine/master/logo.svg" />
    <h1>Paradise Engine</h1>
    <p>2D JavaScript/WebGL engine.</p>
    <p><i>Paradise Engine is an experimental project in a <b>very</b> early pre-alpha stage.</i></p>
</div>

## Contents

1. [Getting Started](#getting-started)
1. [Features](#features)

<h2 id="getting-started">Getting Started</h2>

Paradise Engine required Node.js v14.x or higher.

### Installing from GitHub Packages registry

Add a `.npmrc` file to the root of your package and add the following line to it:

```
@paradise-engine:registry=https://npm.pkg.github.com
```

This makes sure that any packages scoped with `@paradise-engine` will installed through the GitHub Package registry while all other packages can still be installed from the default NPM registry.

Next, you can install the engine package by running:

```
npm install @paradise-engine/engine
```

To use the unstable alpha channel, run:

```
npm install @paradise-engine/engine@alpha
```

<h2 id="features">Features</h2>

- JavaScript-based 2D engine with WebGL rendering
- [Unity](https://unity.com/)-inspired scripting system with first-class TypeScript support
- Rich editor for creating Maps, Tilesets, Sprites, Animations and Scenes
- Build targets for HTML5-capable platforms (Windows, macOS, Linux, iOS, Android)

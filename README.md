# iiif-manifest-to-pdf
A simple demo of a node.js api for downloading a manifest to pdf. Logic from https://github.com/vanda/cocktail

You specify which canvases to add to your pdf through a multi-dimensional array of canvas ranges.

Supports both IIIF v2 and v3 manifests.

# Getting started

1. Clone the repo

2. Install dependancies
`npm install`

3. Run the server
`npm run start`

A page that lets you enter a file name, manifest url, and multi-dimensional array of canvas ranges will show up.
|-------------------|-------------------------------------------------------------------------------------------|
| Filename example: | my-manifest |
| Manifest url example: | https://www-demo.canadiana.ca/iiif/oocihm.65600/manifest |
| Canvases example: [[0,5],[10]] (This will take pages 1-5, and 10 from your manifest and add them to your pdf.) |

A pdf will automatically download after the server gets the manifest json and compiles the pdf with the canvas images.

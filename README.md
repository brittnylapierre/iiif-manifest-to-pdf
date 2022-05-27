# iiif-manifest-to-pdf
A simple demo of a node.js api for downloading a manifest to pdf. Logic from https://github.com/vanda/cocktail

You specify which canvases to add to your pdf through a list of canvas ranges.

Supports both IIIF v2 and v3 manifests.

![Screenshot from 2022-05-27 16-06-37](https://user-images.githubusercontent.com/10541019/170782970-f18262dc-2e9d-40b6-8759-99ba4fd704ab.png)
Output: (View)[https://drive.google.com/file/d/1GVOtKjUP9UPpWFVyb9hcTUvdDlnHeH2h/view?usp=sharing]

# Getting started

1. Clone the repo

2. Install dependancies
`npm install`

3. Run the server
`npm run start`

A page that lets you enter a file name, manifest url, and list of canvas ranges will show up.
| Property | Example |
|-------------------|-------------------------------------------------------------------------------------------|
| Filename | my-manifest |
| Manifest url | https://www-demo.canadiana.ca/iiif/oocihm.65600/manifest |
| Canvases | 1-10, 15, 20-25 (This will take pages 1 to 10, 15, and 20 to 25 from your manifest and add them to your pdf.) |

A pdf will automatically download after the server gets the manifest json and compiles the pdf with the canvas images.

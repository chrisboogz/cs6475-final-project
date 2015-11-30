# cs6475-final-project

Hey! This is the final project I threw together for CS 6475. It's a Node.js webserver and Angular.js webapp which allow users to upload images, apply filters, and see the change to their image in real time.

### Installation

In order to run this on your machine, you'll need [node.js and npm](https://nodejs.org/en/) installed (preferably the latest -- that's what I built the project on, and I haven't tested any older builds). You'll also need to have [node-gyp](https://github.com/nodejs/node-gyp) working correctly.

Once you've got those installed you can download and unzip, or clone, this repository, navigate to the project root, and execute the following commands:

```
npm install
node index.js
```

**Note**: You might need to `sudo` that `npm install` if you're having trouble executing it.

And that's it! You should have a webserver running at `http://localhost:3000`, and navigating to that address should bring up the webapp.

### The Frontend

The frontend is a quick and dirty Angular.js webapp which uses Bootstrap for most of the styling. It looks something like this:

![frontend example](http://i.imgur.com/5eHqqf6.png)

You can upload images using the green + icon on the top right, and you can select one of your uploaded images to feature it in the main pane. Once it's in the main pane, you can apply one of four filters to the image and (once it's loaded) view how it changed your image.

### The Backend

This is where the magic happens.

#### Routes

* `/upload` - The frontend POSTs to this endpoint with a single image the user wishes to upload. Upon reception, the image is converted to a `.png` with [lwip](https://github.com/EyalAr/lwip), then parsed out into a pixel array (with some metadata attached) using [pngjs](https://github.com/niegowski/node-pngjs). That pixel array has an ID generated for it, and it's stored in memory. The backend returns the generated ID to the frontend.
* `/images` - A GET to this endpoint returns every image stored in memory as `base64` encoded strings. The backend uses pngjs to repack the parsed pixel arrays back into `.png` format, then converts the binary buffer containing these images into the strings it returns. This conversion is used for every route under `/images`.
* `/images/:id` - A GET to this endpoint (where `:id` is a specified image ID) returns the image stored at that ID.
* `/images/:id/:filter` - A GET to this endpoint (where `:id` is a specified image ID and `:filter` is a specified filter) returns the image stored at that ID after processing it with the specified filter.
 
#### Filters

* `blur` - This filter runs a separable convolution over the image, using `[1/9, 2/9, 3/9, 2/9, 1/9]` as the horizontal and vertical weightings. The convolution method used is part of the [tracking.js](http://trackingjs.com/) library.
* `sharpen` - This filter runs a big, slow convolution over the whole image, applying a 5x5 kernel. Tracking.js didn't have anything available for non-separable kernels (and other libraries made it way too easy), so I wrote this convolution method myself. The kernel used is:
```
[
  [-1/8, -1/8, -1/8, -1/8, -1/8],
  [-1/8,  2/8,  2/8,  2/8, -1/8],
  [-1/8,  2/8,    1,  2/8, -1/8],
  [-1/8,  2/8,  2/8,  2/8, -1/8],
  [-1/8, -1/8, -1/8, -1/8, -1/8]
]
```
* `emboss` - This filter uses the same custom-built convolution method as `sharpen`, this time applying a 3x3 kernel to the image. After the kernel is applied to each chunk of the image, a bias of 128 is added. The kernel used is:
```
[
  [-2, -2, 0],
  [-2,  6, 0],
  [ 0,  0, 0]
]
```
* `grayscale` - This filter converts the RGBA image to greyscale using tracking.js. I pretty much only added this one because it looks neat and it was really simple to set up.

### Room for improvement

During development, I ran into a few things that I'd potentially improve on in a later iteration:
* Support for DB storage - It would be really nice to be able to hook my backend up to something like MongoDB and eliminate any potential for memory shortages. However, I didn't want anyone to have to install a full-featured DB simply to play around with my project, so I kept it out for now. A more serious build would definitely use a DB connection, though.
* Multi-user support - User management would be cool, and would open the door for things like image sharing and potentially collaboration if the editing feature-set were to expand.
* Backend optimizations - Node.js is a single-threaded webserver, so expensive processing not only slows down a single user - it has the potential to hamper every single user's experience. The filter methods are especially expensive, so in a production environment those would need to be moved out of Node's event loop and into asynchronous processes.

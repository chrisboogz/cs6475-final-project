var tracking = require('../tracking');

function grayscale(imageData) {
    var pixelArray = bufferToArray(imageData.data);

    var grayed = tracking.Image.grayscale(pixelArray, imageData.width, imageData.height, true);

    if(grayed) {
        imageData.data = new Buffer(grayed);
    }

    return imageData;
}

function blur(imageData) {
    var pixelArray = bufferToArray(imageData.data);

    var hWeights = [1/9, 2/9, 3/9, 2/9, 1/9];
    var vWeights = [1/9, 2/9, 3/9, 2/9, 1/9];

    var convolved = tracking.Image.separableConvolve(pixelArray, imageData.width, imageData.height, hWeights, vWeights);

    if(convolved) {
        imageData.data = new Buffer(convolved);
    }

    return imageData;
}

function sharpen(imageData) {
    var pixelArray = bufferToArray(imageData.data);

    var kernel = [
        [-1/8, -1/8, -1/8, -1/8, -1/8],
        [-1/8, 2/8, 2/8, 2/8, -1/8],
        [-1/8, 2/8, 1, 2/8, -1/8],
        [-1/8, 2/8, 2/8, 2/8, -1/8],
        [-1/8, -1/8, -1/8, -1/8, -1/8]
    ];

    var convolved = slowConvolve(pixelArray, imageData.width, imageData.height, kernel);

    if(convolved) {
        imageData.data = new Buffer(convolved);
    }

    return imageData;
}

function emboss(imageData) {
    var pixelArray = bufferToArray(imageData.data);

    var kernel = [
        [-2, -2, 0],
        [-2, 6, 0],
        [0, 0, 0]
    ];

    var convolved = slowConvolve(pixelArray, imageData.width, imageData.height, kernel, 128);

    if(convolved) {
        imageData.data = new Buffer(convolved);
    }

    return imageData;
}

function slowConvolve(pixelArray, width, height, kernel, bias) {
    var output = [];

    for(var i=0; i<pixelArray.length; i+=4) {
        var chunks = getChunks(pixelArray, width, height, i, kernel.length);

        output.push(computeGradient(chunks.r, kernel, bias));
        output.push(computeGradient(chunks.g, kernel, bias));
        output.push(computeGradient(chunks.b, kernel, bias));
        output.push(computeGradient(chunks.a, kernel, bias));
    }

    return output;
}

function computeGradient(chunk, kernel, bias) {
    var crossCorrelation = 0;
    for(var i=0; i<chunk.length; i++) {
        for(var j=0; j<chunk[i].length; j++) {
            crossCorrelation += (kernel[i][j] * chunk[i][j]);
        }
    }
    if(bias) {
        crossCorrelation += bias;
    }
    return Math.abs(crossCorrelation);
}

function getChunks(pixelArray, width, height, i, dimension) {
    var chunkR = getChunk(pixelArray, width, height, 0, i, dimension);
    var chunkG = getChunk(pixelArray, width, height, 1, i, dimension);
    var chunkB = getChunk(pixelArray, width, height, 2, i, dimension);
    var chunkA = getChunk(pixelArray, width, height, 3, i, dimension);

    return {
        r: chunkR,
        g: chunkG,
        b: chunkB,
        a: chunkA
    };
}

function getChunk(pixelArray, width, height, channel, i, dimension) {
    var chunk;
    if(dimension === 3) {
        chunk = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
    }
    else if(dimension === 5) {
        chunk = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
    }

    var currentRow = i / (width*4);
    var currentCol = (i/4) % width;

    var aboveIndex, belowIndex;
    if(dimension === 3) {
        if(currentRow > 0) {
            aboveIndex = i - width*4;
            if(currentCol > 0) {
                chunk[0][0] = pixelArray[aboveIndex - 4 + channel];
            }
            chunk[0][1] = pixelArray[aboveIndex + channel];
            if(currentCol < width - 1) {
                chunk[0][2] = pixelArray[aboveIndex + 4 + channel];
            }
        }
        if(currentCol > 0) {
            chunk[1][0] = pixelArray[i - 4 + channel];
        }
        chunk[1][1] = pixelArray[i + channel];
        if(currentCol < width - 1) {
            chunk[1][2] = pixelArray[i + 4 + channel];
        }
        if(currentRow < height - 1) {
            belowIndex = i + width*4;
            if(currentCol > 0) {
                chunk[2][0] = pixelArray[belowIndex - 4 + channel];
            }
            chunk[2][1] = pixelArray[belowIndex + channel];
            if(currentCol < width - 1) {
                chunk[2][2] = pixelArray[belowIndex + 4 + channel];
            }
        }
    }
    else if (dimension === 5) {
        if(currentRow > 1) {
            aboveIndex = i - width*8;
            if(currentCol > 1) {
                chunk[0][0] = pixelArray[aboveIndex - 8 + channel];
            }
            if(currentCol > 0) {
                chunk[0][1] = pixelArray[aboveIndex - 4 + channel];
            }
            chunk[0][2] = pixelArray[aboveIndex + channel];
            if(currentCol < width - 1) {
                chunk[0][3] = pixelArray[aboveIndex + 4 + channel];
            }
            if(currentCol < width - 2) {
                chunk[0][4] = pixelArray[aboveIndex + 8 + channel];
            }
        }
        if(currentRow > 0) {
            aboveIndex = i - width*4;
            if(currentCol > 1) {
                chunk[1][0] = pixelArray[aboveIndex - 8 + channel];
            }
            if(currentCol > 0) {
                chunk[1][1] = pixelArray[aboveIndex - 4 + channel];
            }
            chunk[1][2] = pixelArray[aboveIndex + channel];
            if(currentCol < width - 1) {
                chunk[1][3] = pixelArray[aboveIndex + 4 + channel];
            }
            if(currentCol < width - 2) {
                chunk[1][4] = pixelArray[aboveIndex + 8 + channel];
            }
        }
        if(currentCol > 1) {
            chunk[2][0] = pixelArray[i - 8 + channel];
        }
        if(currentCol > 0) {
            chunk[2][1] = pixelArray[i - 4 + channel];
        }
        chunk[2][2] = pixelArray[i + channel];
        if(currentCol < width - 1) {
            chunk[2][3] = pixelArray[i + 4 + channel];
        }
        if(currentCol < width - 2) {
            chunk[2][4] = pixelArray[i + 8 + channel];
        }
        if(currentRow < height - 1) {
            belowIndex = i + width*4;
            if(currentCol > 1) {
                chunk[3][0] = pixelArray[belowIndex - 8 + channel];
            }
            if(currentCol > 0) {
                chunk[3][1] = pixelArray[belowIndex - 4 + channel];
            }
            chunk[3][2] = pixelArray[belowIndex + channel];
            if(currentCol < width - 1) {
                chunk[3][3] = pixelArray[belowIndex + 4 + channel];
            }
            if(currentCol < width - 2) {
                chunk[3][4] = pixelArray[belowIndex + 8 + channel];
            }
        }
        if(currentRow < height - 2) {
            belowIndex = i + width*8;
            if(currentCol > 1) {
                chunk[4][0] = pixelArray[belowIndex - 8 + channel];
            }
            if(currentCol > 0) {
                chunk[4][1] = pixelArray[belowIndex - 4 + channel];
            }
            chunk[4][2] = pixelArray[belowIndex + channel];
            if(currentCol < width - 1) {
                chunk[4][3] = pixelArray[belowIndex + 4 + channel];
            }
            if(currentCol < width - 2) {
                chunk[4][4] = pixelArray[belowIndex + 8 + channel];
            }
        }
    }

    return chunk;
}


function bufferToArray(buffer) {
    return Array.prototype.slice.call(buffer, 0);
}

module.exports = {
    grayscale: grayscale,
    blur: blur,
    sharpen: sharpen,
    emboss: emboss
};
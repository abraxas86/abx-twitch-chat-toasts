const sharp = require('sharp');
const fs = require('fs');

// Define input image path and output grid image path
const inputImagePath = 'input.jpg';
const outputGridPath = 'grid.jpg';

// Resize the input image
const resizedWidth = 800; // Width of the resized image
const resizedHeight = 600; // Height of the resized image
sharp(inputImagePath)
    .resize(resizedWidth, resizedHeight)
    .toBuffer()
    .then(resizedBuffer => {
        // Create a grid overlay on the resized image
        const gridSize = 50; // Size of the grid squares
        const gridColor = '#000000'; // Color of the grid lines

        const numColumns = Math.ceil(resizedWidth / gridSize);
        const numRows = Math.ceil(resizedHeight / gridSize);

        const gridImage = sharp({
            create: {
                width: resizedWidth,
                height: resizedHeight,
                channels: 3, // 3 channels for RGB
                background: { r: 255, g: 255, b: 255 } // White background
            }
        });

        // Draw vertical grid lines
        for (let x = 0; x < numColumns; x++) {
            gridImage.line(x * gridSize, 0, x * gridSize, resizedHeight, { color: gridColor });
        }

        // Draw horizontal grid lines
        for (let y = 0; y < numRows; y++) {
            gridImage.line(0, y * gridSize, resizedWidth, y * gridSize, { color: gridColor });
        }

        // Composite the resized image with the grid overlay
        gridImage
            .composite([{ input: resizedBuffer }])
            .toFile(outputGridPath)
            .then(() => {
                console.log('Grid image generated successfully!');
            })
            .catch(err => {
                console.error('Error generating grid image:', err);
            });
    })
    .catch(err => {
        console.error('Error resizing image:', err);
    });

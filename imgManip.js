const sharp = require('sharp');
const fs = require('fs');

// Function to generate the diagonal grid
async function generateDiagonalGrid(inputImagePath, outputImagePath, gridSize) {
    const inputImage = sharp(inputImagePath);
    const imageMetadata = await inputImage.metadata();

    const outputImage = sharp({
        create: {
            width: imageMetadata.width * gridSize,
            height: imageMetadata.height * gridSize,
            channels: imageMetadata.channels,
            background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        }
    });

    const halfWidth = imageMetadata.width / 2;
    const halfHeight = imageMetadata.height / 2;

    // Loop to paste the input image diagonally
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            await outputImage.composite([{
                input: inputImagePath,
                left: x * imageMetadata.width + halfWidth * ((y + 1) % 2),
                top: y * imageMetadata.height,
                blend: 'over'
            }]);
        }
    }

    // Save the output image
    await outputImage.png().toFile(outputImagePath);
}

// Example usage
const inputImagePath = 'https://static-cdn.jtvnw.net/emoticons/v2/307313171/default/dark/1.0';
const outputImagePath = 'output.png';
const gridSize = 5; // Change this to adjust the grid size

generateDiagonalGrid(inputImagePath, outputImagePath, gridSize)
    .then(() => console.log('Diagonal grid generated successfully!'))
    .catch(err => console.error('Error generating diagonal grid:', err));

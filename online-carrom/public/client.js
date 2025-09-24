// client.js

// ... (keep all the socket.io code from before) ...

// --- Game Drawing and Logic (NEW and IMPROVED) ---

function drawBoard() {
    const canvas = document.getElementById('carrom-board');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // --- Colors and Styles ---
    const boardColor = '#FDF5E6'; // A creamy, wooden color (OldLace)
    const borderColor = '#8B4513'; // A dark brown (SaddleBrown)
    const lineColor = '#4a2c0c'; // A very dark brown for lines
    const pocketColor = '#000000'; // Black for pockets
    const arrowColor = '#D22B2B'; // A deep red (Firebrick)

    // --- Dimensions ---
    const padding = 30; // Distance from edge to playing area
    const pocketRadius = 25;
    const centerCircleRadius = 50;
    const baseLineOffset = width / 4; // How far the baselines are from the center

    // 1. Clear and Draw the Main Board Surface
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw the Outer Border (Frame)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 15; // A thick, chunky border
    ctx.strokeRect(0, 0, width, height);
    ctx.lineWidth = 1; // Reset line width for finer lines

    // 3. Draw the Four Corner Pockets
    ctx.fillStyle = pocketColor;
    const pocketPositions = [
        { x: padding, y: padding },
        { x: width - padding, y: padding },
        { x: width - padding, y: height - padding },
        { x: padding, y: height - padding }
    ];

    pocketPositions.forEach(pos => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pocketRadius, 0, 2 * Math.PI);
        ctx.fill();
    });

    // 4. Draw the Center Circle and Design
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Outer Center Circle
    ctx.strokeStyle = lineColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner Center Circle (decorative)
    ctx.strokeStyle = arrowColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius / 2, 0, 2 * Math.PI);
    ctx.stroke();

    // 5. Draw the Four Base Lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 5; // Thicker lines for the base

    // Top
    ctx.strokeRect(baseLineOffset, padding + 60, width - 2 * baseLineOffset, 30);
    // Bottom
    ctx.strokeRect(baseLineOffset, height - padding - 90, width - 2 * baseLineOffset, 30);
    // Left
    ctx.strokeRect(padding + 60, baseLineOffset, 30, height - 2 * baseLineOffset);
    // Right
    ctx.strokeRect(width - padding - 90, baseLineOffset, 30, height - 2 * baseLineOffset);

    // 6. Draw the Decorative Arrows
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    const arrowLength = 50;
    const arrowOffsetFromBase = 40;

    // Top-left arrow
    ctx.beginPath();
    ctx.moveTo(baseLineOffset - arrowOffsetFromBase, baseLineOffset - arrowOffsetFromBase);
    ctx.lineTo(padding + arrowLength, padding + arrowLength);
    ctx.stroke();
    
    // Top-right arrow
    ctx.beginPath();
    ctx.moveTo(width - baseLineOffset + arrowOffsetFromBase, baseLineOffset - arrowOffsetFromBase);
    ctx.lineTo(width - padding - arrowLength, padding + arrowLength);
    ctx.stroke();
    
    // Bottom-left arrow
    ctx.beginPath();
    ctx.moveTo(baseLineOffset - arrowOffsetFromBase, height - baseLineOffset + arrowOffsetFromBase);
    ctx.lineTo(padding + arrowLength, height - padding - arrowLength);
    ctx.stroke();

    // Bottom-right arrow
    ctx.beginPath();
    ctx.moveTo(width - baseLineOffset + arrowOffsetFromBase, height - baseLineOffset + arrowOffsetFromBase);
    ctx.lineTo(width - padding - arrowLength, height - padding - arrowLength);
    ctx.stroke();

    // Reset line width
    ctx.lineWidth = 1;
}

// ... (keep the canvas.addEventListener for sending moves) ...
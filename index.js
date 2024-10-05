//Global Variables
const tex = [];
const asciiDensity = ".:;+=xX$&";
let originalImg;
let img;

//Controllers
let luma = 50;
const lumaVal = document.querySelector("#luma-value");
lumaVal.addEventListener("change", (e) => {
	luma = e.target.value;
	draw();
});

const scaleVal = document.querySelector("#scale-value");
let scale = scaleVal.value;
scaleVal.addEventListener("change", (e) => {
	scale = e.target.value;
	setup();
	draw();
});

let colorToggle = true;
const colorBtn = document.querySelector("#color");
colorBtn.addEventListener("change", () => {
	colorToggle = !colorToggle;
	shadeBtn.disabled = colorToggle;
	draw();
});

let shadeToggle = false;
const shadeBtn = document.querySelector("#shade");
shadeBtn.addEventListener("change", () => {
	shadeToggle = !shadeToggle;
	draw();
});

let typeToggle = "ascii";
const dotToggle = document.querySelector("#dot");
const asciiToggle = document.querySelector("#ascii");

dotToggle.addEventListener("click", () => {
	typeToggle = "dot";
	lumaVal.disabled = false;
	draw();
});
asciiToggle.addEventListener("click", () => {
	typeToggle = "ascii";
	lumaVal.disabled = true;
	draw();
});

const copyBtn = document.querySelector("#copy-btn");
copyBtn.addEventListener("click", () =>
	navigator.clipboard.writeText(tex.join("  ").trim()),
);

const saveBtn = document.querySelector("#save-btn");
saveBtn.addEventListener("click", () => save("image.jpg"));

const uploadBtn = document.querySelector("#upload-btn");
uploadBtn.addEventListener("change", (e) => {
	const file = e.target.files[0];

	const urlOfImage = URL.createObjectURL(file);
	loadImage(urlOfImage, (loadedImg) => {
		originalImg = loadedImg;

		resetOperation();
	});
});

//Drawing Functions
function preload() {
	const initImages = [
		"public/spirited-away.webp",
		"public/ponyo.webp",
		"public/totoro.avif",
		"public/grave-of-the-fireflies.jpg",
	];
	originalImg = loadImage(
		initImages[Math.floor(Math.random() * initImages.length)],
	);
}

function setup() {
	if (!originalImg) return;

	clear();
	img = originalImg.get();
	const mainCanvas = document.querySelector("#main-canvas");
	const ratio = img.width / img.height;
	img.resize(img.width * (scale / 100) * ratio, img.height * (scale / 100));

	if (img.width > img.height)
		createCanvas(
			mainCanvas.offsetWidth,
			mainCanvas.offsetWidth / ratio,
			mainCanvas,
		);
	else if (img.width < img.height)
		createCanvas(
			mainCanvas.offsetHeight * ratio,
			mainCanvas.offsetHeight,
			mainCanvas,
		);
	else
		createCanvas(mainCanvas.offsetHeight, mainCanvas.offsetHeight, mainCanvas);

	noLoop();
}

function draw() {
	if (!originalImg) return;

	clear();
	img.loadPixels();

	const w = width / img.width; // 10
	const h = height / img.height; // 10
	tex.length = 0;

	for (let row = 0; row < img.height; row++) {
		for (let col = 0; col < img.width; col++) {
			const index = (col + row * img.width) * 4;
			const r = img.pixels[index + 0];
			const g = img.pixels[index + 1];
			const b = img.pixels[index + 2];

			if (typeToggle === "ascii") drawAscii(r, g, b, col, row, w, h);
			else drawDot(r, g, b, col, row, w, h);
		}
	}
	img.updatePixels();

	document.querySelector("#og-pixel-count").textContent =
		originalImg.width * originalImg.height;
	document.querySelector("#pixel-count").textContent = img.width * img.height;
}

const sRGBToLin = (channel) =>
	channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const Y_to_LStar = (Y) => (Y <= 0.008856 ? Y * 903.3 : Y ** (1 / 3) * 116 - 16);

const drawAscii = (r, g, b, col, row, w, h) => {
	const avg = (r + g + b) / 3;

	const char = floor(map(avg, 0, 255, 0, asciiDensity.length - 1));
	noStroke();
	if (colorToggle) fill(r, g, b);
	else if (shadeToggle) fill(avg);
	else fill(255, 255, 255);
	textSize(6);
	textAlign(CENTER, CENTER);
	text(asciiDensity[char], col * w + w * 0.5, row * h + h * 0.5);

	registerChar(asciiDensity[char], col);
};

const drawDot = (r, g, b, col, row, w, h) => {
	const luminance =
		0.2126 * sRGBToLin(r / 255) +
		0.7152 * sRGBToLin(g / 255) +
		0.0722 * sRGBToLin(b / 255);
	const perceivedBrightness = Y_to_LStar(luminance);

	noStroke();
	if (colorToggle) fill(r, g, b);
	else if (shadeToggle) {
		const avg = (r + g + b) / 3;
		fill(avg);
	} else fill(255, 255, 255);

	textSize(10);
	textAlign(CENTER, CENTER);
	text(
		perceivedBrightness >= luma ? "." : " ",
		col * w + w * 0.5,
		row * h + h * 0.5,
	);
	const char = perceivedBrightness >= luma ? "." : " ";
	registerChar(char, col);
};

const registerChar = (char, col) => {
	if (col === img.width - 1) tex.push(`${char}\n`);
	else tex.push(char);
};

const resetOperation = () => {
	scaleVal.value = 25;
	scale = 25;
	lumaVal.value = 50;
	luma = 50;
	colorToggle = true;
	colorBtn.checked = true;
	shadeToggle = false;
	shadeBtn.checked = false;
	typeToggle = "ascii";
	asciiToggle.checked = true;
	dotToggle.checked = false;

	setup();
	draw();
};

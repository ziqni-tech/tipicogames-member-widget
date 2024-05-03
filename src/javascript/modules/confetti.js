// global variables
const confetti = document.getElementById('confetti');
const confettiCtx = confetti.getContext('2d');
let container = [];
const confettiElements = [];

const rand = (min, max) => Math.random() * (max - min) + min;

const confettiParams = {
  number: 170,
  size: { x: [5, 25], y: [10, 28] },
  initSpeed: 35,
  gravity: 0,
  drag: 0.08,
  terminalVelocity: 8,
  flipSpeed: 0.017
};

const colors = [
  { front: '#FF8888', back: '#5EDAFF' }
];

setupCanvas();
updateConfetti();

function Conf () {
  this.colorPair = colors[Math.floor(rand(0, colors.length))];
  this.dimensions = {
    x: rand(confettiParams.size.x[0], confettiParams.size.x[1]),
    y: rand(confettiParams.size.y[0], confettiParams.size.y[1])
  };
  this.position = {
    x: container.w / 2,
    y: container.h / 2
  };
  this.rotation = rand(0, 2 * Math.PI);
  this.scale = { x: 1, y: 1 };
  this.velocity = {
    x: rand(-confettiParams.initSpeed, confettiParams.initSpeed) * 0.4,
    y: rand(-confettiParams.initSpeed, confettiParams.initSpeed)
  };
  this.flipSpeed = rand(0.2, 1.5) * confettiParams.flipSpeed;

  this.terminalVelocity = rand(1, 1.5) * confettiParams.terminalVelocity;

  this.update = function () {
    this.velocity.x *= 0.98;
    this.position.x += this.velocity.x;

    this.velocity.y += (confettiParams.drag);
    this.velocity.y += confettiParams.gravity;
    this.velocity.y = Math.min(this.velocity.y, this.terminalVelocity);
    this.position.y += this.velocity.y;

    this.scale.y = Math.cos(this.position.y * this.flipSpeed);
    this.color = this.scale.y > 0 ? this.colorPair.front : this.colorPair.back;
  };
}

function updateConfetti () {
  confettiCtx.clearRect(0, 0, container.w, container.h);

  confettiElements.forEach((c) => {
    c.update();
    confettiCtx.translate(c.position.x, c.position.y);
    confettiCtx.rotate(c.rotation);
    const width = (c.dimensions.x * c.scale.x);
    const height = (c.dimensions.y * c.scale.y);
    confettiCtx.fillStyle = c.color;
    confettiCtx.fillRect(-0.5 * width, -0.5 * height, width, height);
    confettiCtx.setTransform(1, 0, 0, 1, 0, 0);
  });

  confettiElements.forEach((c, idx) => {
    if (c.position.y > container.h ||
      c.position.x < -0.5 * container.x ||
      c.position.x > 1.5 * container.x) {
      confettiElements.splice(idx, 1);
    }
  });
  window.requestAnimationFrame(updateConfetti);
}

function setupCanvas () {
  container = {
    w: confetti.clientWidth,
    h: confetti.clientHeight
  };
  confetti.width = container.w;
  confetti.height = container.h;
}

function addConfetti () {
  for (let i = 0; i < confettiParams.number; i++) {
    confettiElements.push(new Conf());
  }
}

function confettiLoop () {
  addConfetti();
  setTimeout(confettiLoop, 700 + Math.random() * 1700);
}

export function startConfetti () {
  confettiLoop();
}

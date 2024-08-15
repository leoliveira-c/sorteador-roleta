const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const arrow = document.querySelector("img[alt='spinner-arrow']");

let span = document.getElementsByClassName("close")[0];
let modal = document.getElementById("resultModal");
let myChart;
let rotationDegrees = 0;

const getArrowPosition = () => {
  const arrowRect = arrow.getBoundingClientRect();
  const wheelRect = wheel.getBoundingClientRect();
  const arrowCenterX = arrowRect.left + arrowRect.width / 2;
  const arrowCenterY = arrowRect.top + arrowRect.height / 2;
  const wheelCenterX = wheelRect.left + wheelRect.width / 2;
  const wheelCenterY = wheelRect.top + wheelRect.height / 2;
  const deltaX = arrowCenterX - wheelCenterX;
  const deltaY = wheelCenterY - arrowCenterY;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (angle + 360) % 360;
};

const createChart = (labels, data, colors) => {
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(wheel, {
    plugins: [ChartDataLabels],
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          backgroundColor: colors,
          data: data,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 0 },
      rotation: rotationDegrees,
      plugins: {
        tooltip: false,
        legend: {
          display: false,
        },
        datalabels: {
          color: "#ffffff",
          textStrokeColor: "#000000",
          textStrokeWidth: 1,
          formatter: (_, context) => context.chart.data.labels[context.dataIndex],
          font: { size: 16 },
          align: 'start',
          anchor: 'end',
          textAlign: 'center',
          rotation: (context) => {
            const totalSlices = context.chart.data.labels.length;
            const sliceAngle = 360 / totalSlices;
            const startAngle = context.dataIndex * sliceAngle + rotationDegrees;
            const labelRotation = startAngle + sliceAngle / 2;
            return labelRotation - 90;
          },
          offset: 0,
        },
      },
    },
  });
};

const generateColors = (numColors) => {
  const colors = [];
  const third = Math.floor(numColors / 3);
  const remainder = numColors % 3;

  const getColor = (start, end, ratio, lightness = 50) => {
    const hue = start + (end - start) * ratio;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  };

  const solidRatio = 0.7;
  const gradientRatio = 0.2;

  for (let i = 0; i < third; i++) {
    if (i < third * solidRatio) {
      colors.push(getColor(0, 0, 0));
    } else {
      const ratio = (i - third * solidRatio) / (third * gradientRatio);
      colors.push(getColor(0, 60, ratio));
    }
  }


  for (let i = 0; i < third; i++) {
    if (i < third * solidRatio) {
      colors.push(getColor(60, 60, 0));
    } else {
      const ratio = (i - third * solidRatio) / (third * gradientRatio);
      colors.push(getColor(60, 120, ratio));
    }
  }

  for (let i = 0; i < third; i++) {
    if (i < third * solidRatio) {
      colors.push(getColor(120, 120, 0, 40)); 
    } else {
      const ratio = (i - third * solidRatio) / (third * gradientRatio);
      colors.push(getColor(120, 0, ratio));
    }
  }

  if (remainder > 0) {
    for (let i = 0; i < remainder; i++) {
      if (i < remainder / 3) {
        const ratio = i / (remainder / 3);
        colors.push(getColor(0, 60, ratio));
      } else if (i < 2 * remainder / 3) {
        const ratio = (i - remainder / 3) / (remainder / 3);
        colors.push(getColor(60, 120, ratio));
      } else {
        const ratio = (i - 2 * remainder / 3) / (remainder / 3);
        colors.push(getColor(120, 0, ratio));
      }
    }
  }

  return colors;
};

const getRandomDegree = (numSegments) => {
  const segmentAngle = 360 / numSegments;
  const randomSegment = Math.floor(Math.random() * numSegments);
  const randomDegree = randomSegment * segmentAngle;
  return randomDegree;
};

const spinWheel = () => {
  spinBtn.disabled = true;
  const numSegments = myChart.data.labels.length;
  const randomDegree = getRandomDegree(numSegments);
  const spinAmount = 360 * 10 + randomDegree;

  let currentDegree = 0;
  const spinInterval = setInterval(() => {
    currentDegree += 10;
    rotationDegrees = (rotationDegrees + 10) % 360;
    myChart.options.rotation = rotationDegrees;
    myChart.update();

    if (currentDegree >= spinAmount) {
      clearInterval(spinInterval);

      const arrowOffsetDegrees = 269;
      const finalDegree = (rotationDegrees + arrowOffsetDegrees) % 360;

      const degreesPerSegment = 360 / numSegments;
      const segmentIndex = Math.floor((360 - finalDegree) / degreesPerSegment) % numSegments;
      const selectedSegment = myChart.data.labels[segmentIndex];

      document.getElementById('modalResult').innerHTML = `O resultado foi: ${selectedSegment}`;

      modal.style.display = "block";
      spinBtn.disabled = false;
    }

    span.onclick = function () {
      modal.style.display = "none";
    }

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }, 10);
};

spinBtn.addEventListener("click", spinWheel);

const atualizarGrafico = () => {
  const labelsInput = document.getElementById("labelsInput").value;
  const labels = labelsInput.split(",").map(label => label.trim());
  const data = Array(labels.length).fill(100 / labels.length);
  const colors = generateColors(labels.length);
  createChart(labels, data, colors);
};

atualizarGrafico();
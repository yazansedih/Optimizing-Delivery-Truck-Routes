document.addEventListener("DOMContentLoaded", () => {
  const depot = { x: 75, y: 75, weight: 0 };
  const trucks = [
    { id: 1, capacity: 150 },
    { id: 2, capacity: 150 },
    { id: 3, capacity: 150 },
  ];
  const panel = document.querySelector(".panel");
  const form = document.getElementById("delivery-form");
  const weightInput = document.getElementById("weight");
  const initialSolutionButton = document.querySelector(".initial-solution");
  const optimizationSolutionButton = document.querySelector(
    ".optimization-solution"
  );
  const clear = document.querySelector(".clear");

  let deliveryPoints = [];
  let potentialSolutions = Array.from({ length: trucks.length }, () => []);
  let remainingCapacity = trucks.map((truck) => truck.capacity);
  let remainingPoints;

  const savedPoints = JSON.parse(localStorage.getItem("deliveryPoints"));
  if (savedPoints) {
    deliveryPoints = savedPoints;
    displayDeliveryPoints();
  }

  panel.addEventListener("click", (event) => {
    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight < 0) {
      alert(
        "Please enter a valid weight (>= 0) before adding a delivery point."
      );
      return;
    }
    addDeliveryPoint(event.clientX, event.clientY, weight);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight < 0) {
      alert(
        "Please enter a valid weight (>= 0) before adding a delivery point."
      );
      return;
    }
    const rect = panel.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    addDeliveryPoint(rect.left + x, rect.top + y, weight);
  });

  initialSolutionButton.addEventListener("click", () => {
    calculateAndDisplayRoutes();
  });

  optimizationSolutionButton.addEventListener("click", () => {
    optimizeRoutes();
  });

  clear.addEventListener("click", () => {
    deliveryPoints = [];
    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }
    localStorage.removeItem("deliveryPoints");

    displayDepot();
    potentialSolutions = Array.from({ length: trucks.length }, () => []);
    remainingCapacity = trucks.map((truck) => truck.capacity);
    remainingPoints = [...deliveryPoints];
  });

  function displayDeliveryPoints() {
    deliveryPoints.forEach((point) => {
      const coordDisplay = document.createElement("div");
      coordDisplay.style.position = "absolute";
      coordDisplay.style.left = `${point.x}px`;
      coordDisplay.style.top = `${point.y}px`;
      coordDisplay.style.backgroundColor = "red";
      coordDisplay.style.width = "10px";
      coordDisplay.style.height = "10px";
      coordDisplay.style.borderRadius = "50%";
      coordDisplay.title = `Weight: ${point.weight}`;
      panel.appendChild(coordDisplay);

      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.left = `${point.x + 5}px`;
      label.style.top = `${point.y + 5}px`;
      label.style.color = "black";
      label.style.backgroundColor = "white";
      label.style.padding = "2px 5px";
      label.style.borderRadius = "3px";
      label.textContent = `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
      panel.appendChild(label);
    });
  }

  function displayDepot() {
    const depotDisplay = document.createElement("div");
    depotDisplay.style.position = "absolute";
    depotDisplay.style.left = `${depot.x}px`;
    depotDisplay.style.top = `${depot.y}px`;
    depotDisplay.style.backgroundColor = "green";
    depotDisplay.style.width = "15px";
    depotDisplay.style.height = "15px";
    depotDisplay.style.borderRadius = "50%";
    depotDisplay.style.zIndex = "999";
    panel.appendChild(depotDisplay);
  }

  function addDeliveryPoint(clientX, clientY, weight) {
    const rect = panel.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const point = { x: offsetX, y: offsetY, weight: weight };
    deliveryPoints.push(point);
    localStorage.setItem("deliveryPoints", JSON.stringify(deliveryPoints));

    const coordDisplay = document.createElement("div");
    coordDisplay.style.position = "absolute";
    coordDisplay.style.left = `${offsetX}px`;
    coordDisplay.style.top = `${offsetY}px`;
    coordDisplay.style.backgroundColor = "red";
    coordDisplay.style.width = "10px";
    coordDisplay.style.height = "10px";
    coordDisplay.style.borderRadius = "50%";
    coordDisplay.style.title = `Weight: ${point.weight}`;
    panel.appendChild(coordDisplay);

    const label = document.createElement("div");
    label.style.position = "absolute";
    label.style.left = `${offsetX + 5}px`;
    label.style.top = `${offsetY + 5}px`;
    label.style.color = "black";
    label.style.backgroundColor = "white";
    label.style.padding = "2px 5px";
    label.style.borderRadius = "3px";
    label.textContent = `(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`;
    panel.appendChild(label);
  }

  function calculateAndDisplayRoutes() {
    let totalDistance = 0;
    remainingPoints = [...deliveryPoints];
    potentialSolutions = Array.from({ length: trucks.length }, () => []);
    remainingCapacity = trucks.map((truck) => truck.capacity);

    trucks.forEach((truck, truckIndex) => {
      let currentPoint = depot;
      let truckDistance = 0;
      while (remainingCapacity[truckIndex] > 0 && remainingPoints.length > 0) {
        let assigned = false;
        for (let i = 0; i < remainingPoints.length; i++) {
          const point = remainingPoints[i];
          if (remainingCapacity[truckIndex] >= point.weight) {
            potentialSolutions[truckIndex].push(point);
            truckDistance += calculateDistance(currentPoint, point);
            drawLine(
              currentPoint,
              point,
              ["blue", "red", "green"][truckIndex % 3]
            );
            currentPoint = point;
            remainingCapacity[truckIndex] -= point.weight;
            remainingPoints.splice(i, 1);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          break;
        }
      }
      if (potentialSolutions[truckIndex].length > 0) {
        truckDistance += calculateDistance(currentPoint, depot);
        drawLine(currentPoint, depot, ["blue", "red", "green"][truckIndex % 3]);
      }
      totalDistance += truckDistance;
    });
    displayInitialDistance(totalDistance);
  }

  function displayInitialDistance(distance) {
    const distanceElement = document.getElementById("initial-distance");
    distanceElement.textContent = `Initial Total Distance: ${distance.toFixed(
      2
    )} units`;
  }

  function calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  function drawLine(startPoint, endPoint, color) {
    let svg = document.querySelector("svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.position = "absolute";
      svg.style.top = 0;
      svg.style.left = 0;
      svg.style.width = "100%";
      svg.style.height = "100%";
      panel.appendChild(svg);
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startPoint.x);
    line.setAttribute("y1", startPoint.y);
    line.setAttribute("x2", endPoint.x);
    line.setAttribute("y2", endPoint.y);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    line.style.zIndex = "998";
    svg.appendChild(line);
  }

  function optimizeRoutes() {
    console.log("Starting optimization...");
    const result = simulatedAnnealing(
      deliveryPoints,
      trucks,
      1000,
      0.995,
      10000
    );
    console.log("Optimization result:", result);
    displayOptimizedRoutes(result.bestSolution);
    displayOptimizedDistance(result.bestDistance);
  }

  function simulatedAnnealing(
    deliveryPoints,
    trucks,
    initialTemperature,
    coolingRate,
    iterations,
    logProgress = false
  ) {
    let currentSolution = generateInitialSolution(deliveryPoints, trucks);
    let currentDistance = calculateTotalDistance(currentSolution);

    let bestSolution = structuredClone(currentSolution);
    let bestDistance = currentDistance;

    let temperature = initialTemperature;

    for (let i = 0; i < iterations; i++) {
      const newSolution = neighborSolution(currentSolution, trucks);
      const newDistance = calculateTotalDistance(newSolution);

      if (
        acceptanceProbability(currentDistance, newDistance, temperature) >
        Math.random()
      ) {
        currentSolution = structuredClone(newSolution);
        currentDistance = newDistance;
      }

      if (currentDistance < bestDistance) {
        bestSolution = structuredClone(currentSolution);
        bestDistance = currentDistance;
      }

      temperature *= 1 - coolingRate;

      if (logProgress && i % 1000 === 0) {
        console.log(
          `Iteration ${i}, Temperature: ${temperature.toFixed(
            2
          )}, Current Distance: ${currentDistance.toFixed(
            2
          )}, Best Distance: ${bestDistance.toFixed(2)}`
        );
      }
    }

    return {
      bestSolution,
      bestDistance,
    };
  }

  function generateInitialSolution(deliveryPoints, trucks) {
    let solution = Array.from({ length: trucks.length }, () => []);
    let remainingPoints = [...deliveryPoints];
    let remainingCapacity = trucks.map((truck) => truck.capacity);

    trucks.forEach((truck, truckIndex) => {
      while (remainingCapacity[truckIndex] > 0 && remainingPoints.length > 0) {
        for (let i = 0; i < remainingPoints.length; i++) {
          const point = remainingPoints[i];
          if (remainingCapacity[truckIndex] >= point.weight) {
            solution[truckIndex].push(point);
            remainingCapacity[truckIndex] -= point.weight;
            remainingPoints.splice(i, 1);
            break;
          }
        }
      }
    });
    return solution;
  }

  function neighborSolution(currentSolution, trucks) {
    let newSolution = JSON.parse(JSON.stringify(currentSolution));
    const truckIndex = Math.floor(Math.random() * trucks.length);
    const route = newSolution[truckIndex];

    if (route.length > 1) {
      const pointIndex1 = Math.floor(Math.random() * route.length);
      let pointIndex2 = Math.floor(Math.random() * route.length);
      while (pointIndex1 === pointIndex2) {
        pointIndex2 = Math.floor(Math.random() * route.length);
      }

      [route[pointIndex1], route[pointIndex2]] = [
        route[pointIndex2],
        route[pointIndex1],
      ];
    }
    return newSolution;
  }

  function calculateTotalDistance(solution) {
    let totalDistance = 0;
    solution.forEach((route) => {
      let currentPoint = depot;
      route.forEach((point) => {
        totalDistance += calculateDistance(currentPoint, point);
        currentPoint = point;
      });
      totalDistance += calculateDistance(currentPoint, depot);
    });
    return totalDistance;
  }

  function acceptanceProbability(currentDistance, newDistance, temperature) {
    if (newDistance < currentDistance) {
      return 1.0;
    }
    return Math.exp((currentDistance - newDistance) / temperature);
  }

  function displayOptimizedRoutes(solution) {
    console.log("Displaying optimized routes:", solution);
    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }

    displayDepot();
    displayDeliveryPoints();

    solution.forEach((route, truckIndex) => {
      let currentPoint = depot;
      route.forEach((point) => {
        drawLine(currentPoint, point, ["blue", "red", "green"][truckIndex % 3]);
        currentPoint = point;
      });
      drawLine(currentPoint, depot, ["blue", "red", "green"][truckIndex % 3]);
    });
  }

  function displayOptimizedDistance(distance) {
    const distanceElement = document.getElementById("optimized-distance");
    distanceElement.textContent = `Optimized Total Distance: ${distance.toFixed(
      2
    )} units`;
  }

  displayDepot();
  displayDeliveryPoints();
});

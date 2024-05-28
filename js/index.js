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

  let potentialSolutions = Array.from({ length: trucks.length }, () => []);
  let remainingCapacity = trucks.map((truck) => truck.capacity);
  let remainingPoints;

  let deliveryPoints = JSON.parse(localStorage.getItem("deliveryPoints")) || [];
  localStorage.removeItem("deliveryPoints");
  deliveryPoints = [];

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
    const weight = parseInt(weightInput.value);
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
    console.log("Delivery Points:", deliveryPoints);
    const result = simulatedAnnealing(
      initialSolution,
      depot,
      1000,
      0.995,
      10000
    );
    result.bestSolution.forEach((route) => {
      for (let i = 0; i < route.length - 1; i++) {
        drawLine(route[i], route[i + 1]);
      }
    });
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

  //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////

  const displayDeliveryPoints = () => {
    console.log("Delivery Points:", deliveryPoints);
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
    });
  };

  const displayDepot = () => {
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
  };

  function addDeliveryPoint(clientX, clientY, weight) {
    const rect = panel.getBoundingClientRect();
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);

    const newPoint = { x, y, weight };
    deliveryPoints.push(newPoint);

    localStorage.setItem("deliveryPoints", JSON.stringify(deliveryPoints));
    displayDeliveryPoints();
  }

  function calculateAndDisplayRoutes() {
    const initialSolution = generateInitialSolution(deliveryPoints, trucks);
    displayDeliveryPoints();
  }

  function generateInitialSolution(deliveryPoints, trucks) {
    potentialSolutions = Array.from({ length: trucks.length }, () => []);
    remainingCapacity = trucks.map((truck) => truck.capacity);
    remainingPoints = [...deliveryPoints]; // Copy the array to keep track of unassigned points

    trucks.forEach((truck, truckIndex) => {
      let currentPoint = depot;
      while (remainingCapacity[truckIndex] > 0 && remainingPoints.length > 0) {
        let assigned = false;
        for (let i = 0; i < remainingPoints.length; i++) {
          const point = remainingPoints[i];
          if (remainingCapacity[truckIndex] >= point.weight) {
            potentialSolutions[truckIndex].push(point);
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

        if (!assigned && potentialSolutions[truckIndex].length > 0) {
          break;
        }
      }

      if (potentialSolutions[truckIndex].length > 0) {
        drawLine(currentPoint, depot, ["blue", "red", "green"][truckIndex % 3]);
        potentialSolutions[truckIndex].push(depot);
      }
    });

    return potentialSolutions;
  }

  function drawLine(startPoint, endPoint, color) {
    let svg = document.querySelector("svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
});

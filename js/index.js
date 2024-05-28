document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector(".panel");
  const form = document.getElementById("delivery-form");
  const weightInput = document.getElementById("weight");

  localStorage.removeItem("deliveryPoints");
  let deliveryPoints = [];

  const displayDeliveryPoints = () => {
    deliveryPoints.forEach((point) => {
      const coordDisplay = document.createElement("div");
      coordDisplay.style.position = "absolute";
      coordDisplay.style.left = `${point.x}px`;
      coordDisplay.style.top = `${point.y}px`;
      coordDisplay.style.backgroundColor = "red";
      coordDisplay.style.width = "5px";
      coordDisplay.style.height = "5px";
      coordDisplay.style.borderRadius = "50%";
      coordDisplay.title = `Weight: ${point.weight}`;
      panel.appendChild(coordDisplay);
    });
  };

  displayDeliveryPoints();

  panel.addEventListener("click", (event) => {
    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight < 0) {
      alert(
        "Please enter a valid weight (>= 0) before adding a delivery point."
      );
      return;
    }

    addDeliveryPoint(event.clientX, event.clientY);
  });

  // Submit event listener for the form
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

    addDeliveryPoint(rect.left + x, rect.top + y);

    // weightInput.value = "";
  });

  function addDeliveryPoint(clientX, clientY) {
    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight < 0) {
      alert(
        "Please enter a valid weight (>= 0) before adding a delivery point."
      );
      return;
    }

    const rect = panel.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newPoint = { x, y, weight };
    deliveryPoints.push(newPoint);

    // Save the updated delivery points to local storage
    localStorage.setItem("deliveryPoints", JSON.stringify(deliveryPoints));

    const coordDisplay = document.createElement("div");
    coordDisplay.style.position = "absolute";
    coordDisplay.style.left = `${x}px`;
    coordDisplay.style.top = `${y}px`;
    coordDisplay.style.backgroundColor = "red";
    coordDisplay.style.width = "5px";
    coordDisplay.style.height = "5px";
    coordDisplay.style.borderRadius = "50%";
    coordDisplay.title = `Weight: ${weight}`;
    panel.appendChild(coordDisplay);
  }
});

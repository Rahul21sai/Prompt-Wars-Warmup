# WanderlustAI - Travel Planning Assistant

A lightweight, single-page web application designed as a warm-up submission for the Prompt Wars hackathon. It allows users to input their travel preferences and instantly generates a suggested day-wise itinerary.

## Features
- **Capture Travel Preferences:** Input destination, trip duration, budget, and travel style (Adventure, Relaxation, Cultural).
- **Mock Itinerary Generation:** Dynamically generates a day-wise schedule tailored to the selected travel style.
- **Interactive Map:** Embeds a responsive Google Map view of the destination.
- **Export Functionality:** Quickly copy the generated itinerary to your clipboard with a single click.

## How to Run
Since this app is built with plain HTML, CSS, and vanilla JavaScript without any build tools or frameworks, running it is incredibly simple:
1. Clone or download this repository.
2. Open the `index.html` file directly in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).
3. (Optional) To view the functional Google Map, open `index.html` in a code editor and replace `YOUR_API_KEY_HERE` with a valid Google Maps API Key on line ~161.

## External Services Used
- **Google Maps Embed API:** Used to render the interactive map view of the chosen destination. *(Note: The code uses a placeholder API key for security purposes, as requested).*
- **Google Fonts:** Uses the "Inter" font family for modern, clean typography.
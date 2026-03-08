Tweaker-Tea ☕🗺️
Safety-First Navigation for Pedestrians

Tweaker-Tea is a safety-focused navigation tool that helps pedestrians avoid potentially dangerous areas when walking through cities at night.

By combining publicly available crime data with crowdsourced reports, the app generates a real-time safety heatmap and suggests routes that prioritize safety instead of just speed.

Google Maps finds the fastest route.
Tweaker-Tea finds the safest one.

Inspiration

Walking home late at night can feel unpredictable, especially in busy downtown areas. Many people rely on instinct when deciding which streets or alleys to avoid.

While cities publish crime statistics and safety reports, this information usually isn’t integrated into the tools people use to navigate.

We wanted to explore:

What if pedestrians could see a safety heatmap of the city before choosing how to walk home?

This led to the creation of Tweaker-Tea.

What It Does

Tweaker-Tea helps users navigate cities more safely by visualizing crime data and recommending safer walking routes.

Key Features

• Crime Heatmap
Visualizes areas with higher concentrations of reported incidents.

• Safe Route Navigation
Suggests routes that avoid high-risk zones when possible.

• Crowdsourced Safety Reports
Users can report unsafe situations to improve the heatmap.

• Emergency Safety Tools

Panic button

Live location sharing

Loud alarm + flash feature

How It Works

The system generates a safety score for each location based on incident density and user reports.

Public crime data is collected from open police datasets.

Data is converted into geographic coordinates.

Incident density is used to generate a heatmap.

Routes are calculated while minimizing exposure to high-risk areas.

Tech Stack

Frontend

React

Map visualization (Leaflet / Google Maps API)

Backend

Node.js

Express

Data

Open crime datasets

User-submitted safety reports

Visualization

Heatmap overlays

Geographic routing algorithms

Challenges

• Processing and cleaning real-world crime data
• Converting incident reports into usable geographic information
• Balancing route safety with realistic travel times
• Designing a simple interface for safety visualization

Accomplishments

Within the hackathon timeframe we built a working prototype that:

✔ Visualizes crime data as a city-wide heatmap
✔ Demonstrates safer route planning
✔ Integrates emergency safety tools

What We Learned

• How to process and visualize open data
• The importance of responsible safety data interpretation
• How geographic data can influence real-world decision making

Future Improvements

Potential future features include:

• Real-time incident prediction using machine learning
• More city datasets across Canada
• Nighttime risk analysis based on time and lighting
• Integration with campus safety systems
• Verified user reporting

Business Model

Tweaker-Tea could use a freemium model:

Free

Basic safety heatmap

Safe routing

Premium

Real-time alerts

Family location sharing

Advanced safety analytics

Long-term partnerships could include universities, cities, and transit systems.

Demo

Coming soon.

Contributors

Built during a hackathon by:

Joseph Jatou

[Team Member Names]

License

MIT License

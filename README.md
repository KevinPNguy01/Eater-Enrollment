<p align="center"><img src="./src/assets/anteater.png" alt="Logo" width="200"></p>
<h1 align="center">Eater Enrollment</h1>
<p>A course scheduler web app that allows students to search for courses and manage class schedules at UCI.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Course Lookup</strong>: Search for courses by department, course number, GE category, or by keyword.</li>
  <li><strong>Search Refinement</strong>: Filter results by numerous criteria such as meeting times and availability.</li>
  <li><strong>Multi-Search</strong>: Toggle multi-search and search for multiple courses at once in a single search.</li>
  <li><strong>Visual Schedules</strong>: Use the integrated calendar to manage schedules that support both added courses and custom events.</li>
  <li><strong>Intuitive Map</strong>: Find where added courses are located on the map with easy-to-read labelled markers.</li>
  <li><strong>Embedded Reviews</strong>: Hover over instructor names to view their RateMyProfessors</li>
  <li><strong>Embedded Grades</strong>: Hover over the GPA column to view average gpa and grades for a course.</li>
</ul>

<h2>Technologies Used</h2>
<h3>Frontend</h3>
<ul>
  <li><strong>React</strong>: JavaScript UI framework.</li>
  <li><strong>FullCalendar</strong>: React calendar component.</li>
  <li><strong>Recharts</strong>: React chart component.</li>
  <li><strong>MUI</strong>: React UI library.</li>
  <li><strong>Leaflet</strong>: Interactive JavaScript map.</li>
  <li><strong>Redux</strong>: State management.</li>
</ul>

<h3>Backend</h3>
<ul>
  <li><strong>PeterPortal API</strong>: API for retrieving UCI course data.</li>
  <li><strong>GraphQL</strong>: Efficient and precise query language.</li>
  <li><strong>SQLite 3</strong>: Lightweight database library.</li>
  <li><strong>Express.js</strong>: Framework for building RESTful APIs.</li>
</ul>

<h2>Starting the Backend Server</h2>

<p>The backend server is responsible for handling several tasks, including:</p>
<ul>
  <li>Fetching course and grades data</li>
  <li>Saving and loading user schedules</li>
  <li>Retrieving instructor reviews</li>
</ul>

<h3>Installing Dependencies</h3>
<p>Before starting the server, you'll need to install the necessary dependencies. Follow these steps:</p>
<ol>
  <li>Navigate to the <code>/backend/</code> directory in your terminal.</li>
  <li>Run the following command to install all required dependencies:</li>
</ol>

<pre><code>npm install</code></pre>

<h3>Starting the Server</h3>
<p>Once the dependencies are installed, you can start the backend server with the following command:</p>

<pre><code>npm run start</code></pre>

<p>With the server running, it will be ready to handle API requests for fetching and saving data.</p>

<h2>Starting the Frontend</h2>

<p>The frontend of the course scheduler web app is the interface where users interact with the website. To launch the frontend, follow these steps:</p>

<h3>Installing Dependencies</h3>
<p>Before starting the frontend, ensure that all required dependencies are installed. In the root directory, run the following command:</p>

<pre><code>npm install</code></pre>

<h3>Launching the Frontend</h3>
<p>Once the dependencies are installed, you can launch the frontend with the following command:</p>

<pre><code>npm run dev</code></pre>

<p>By default, the website will be accessible at <code>http://localhost:5173</code>. Open this URL in your web browser to start using the application.</p>

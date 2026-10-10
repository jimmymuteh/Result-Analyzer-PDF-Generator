# Rwang'ondu Junior School - Result Analyzer & PDF Generator

A client-side CBC academic report generation tool built with JavaScript, HTML5, and CSS3 that enables teachers to input student marks across all 9 junior school learning areas, compute performance descriptors automatically, and instantly download formatted PDF reports for parents.

## How It Works

### Step 1: Student Details & Marks Input
Teachers enter the student's full name, admission number, and marks out of 100 for all 9 CBC learning areas (English, Kiswahili, Mathematics, Integrated Science, Social Studies, CRE, Agriculture, Pre-Technical, and Creative Arts).

### Step 2: Scoring & Performance Descriptor Engine
The app aggregates total scores, calculates the mean score percentage, and assigns official CBC performance descriptors (e.g., Exceeding Expectation, Meeting Expectation, Approaching Expectation, Below Expectations).

### Step 3: Client-Side PDF Generation
Using the integrated `jsPDF` library, the tool formats and compiles a clean, printable official school report card directly in the browser with zero backend infrastructure required.

### Step 4: Generated Reports History
Maintains a local session log of all processed student reports for quick reference and administrative tracking while reducing manual paperwork.

## Built With
- HTML5 & CSS3
- JavaScript (DOM & Event Handling)
- jsPDF (Client-side PDF export library)
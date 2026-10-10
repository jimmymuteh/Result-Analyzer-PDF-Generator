// === 1. SUBJECT CONFIGURATION & SCORING ENGINE ===
const SUBJECTS = [
  { key: "sub_English", label: "English" },
  { key: "sub_Kiswahili", label: "Kiswahili" },
  { key: "sub_Mathematics", label: "Mathematics" },
  { key: "sub_Science", label: "Integrated Science" },
  { key: "sub_SocialStudies", label: "Social Studies" },
  { key: "sub_CRE", label: "CRE" },
  { key: "sub_Agriculture", label: "Agriculture" },
  { key: "sub_PreTech", label: "Pre-Technical" },
  { key: "sub_CreativeArts", label: "Creative Arts" }
];

const calculatePerformance = (marksMap) => {
  let totalScore = 0;
  SUBJECTS.forEach(sub => {
    totalScore += marksMap[sub.key];
  });

  const meanScore = totalScore / SUBJECTS.length;
  
  // CBC Performance Descriptors
  let descriptor = "Below Expectations";
  if (meanScore >= 75) descriptor = "Exceeding Expectation";
  else if (meanScore >= 55) descriptor = "Meeting Expectation";
  else if (meanScore >= 40) descriptor = "Approaching Expectation";

  return { totalScore: Math.round(totalScore), meanScore: meanScore.toFixed(1), descriptor };
};

// === 2. SESSION HISTORY LOG ===
const sessionLog = [];

const logEntry = (studentName, admissionNo, result) => {
  const entry = {
    id: sessionLog.length + 1,
    time: new Date().toLocaleTimeString(),
    studentName,
    admissionNo,
    ...result
  };
  sessionLog.push(entry);
  return entry;
};

const renderHistory = () => {
  const tableEl = document.querySelector('#historyTable');
  if (!tableEl) return;

  if (!sessionLog.length) {
    tableEl.innerHTML = '<tr><td colspan="5" style="color:#8b949e;text-align:center;padding:1rem;">No reports generated yet.</td></tr>';
    return;
  }
  
  tableEl.innerHTML = sessionLog.map(e => `
    <tr>
      <td style="color:#8b949e;font-size:0.8rem;">${e.time}</td>
      <td><b>${e.studentName}</b></td>
      <td>${e.admissionNo}</td>
      <td>${e.meanScore}%</td>
      <td style="color:#4ecca3;font-weight:600;">${e.descriptor}</td>
    </tr>
  `).join('');
};

// === 3. PDF GENERATION ENGINE ===
const generatePDFReport = (studentName, admissionNo, marksMap, result) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // School Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RWANG'ONDU JUNIOR SCHOOL", 105, 18, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("CBC ACADEMIC PROGRESS REPORT (GRADES 7 - 9)", 105, 25, { align: "center" });

  doc.line(20, 30, 190, 30);

  // Student Bio
  doc.text(`Student Name: ${studentName}`, 20, 40);
  doc.text(`Admission No: ${admissionNo}`, 130, 40);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 47);

  // Table Headers
  let startY = 60;
  doc.setFillColor(30, 30, 30);
  doc.rect(20, startY, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Learning Area (Subject)", 25, startY + 6);
  doc.text("Score (/100)", 150, startY + 6);

  // Table Rows
  startY += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  SUBJECTS.forEach((sub, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, startY - 4, 170, 7, "F");
    }
    doc.text(sub.label, 25, startY);
    doc.text(String(marksMap[sub.key]), 160, startY);
    startY += 8;
  });

  // Summary Section
  startY += 5;
  doc.line(20, startY, 190, startY);
  startY += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Marks: ${result.totalScore} / 900`, 20, startY);
  doc.text(`Mean Score: ${result.meanScore}%`, 20, startY + 8);
  doc.text(`Overall Performance: ${result.descriptor}`, 20, startY + 16);

  // Save File
  doc.save(`${admissionNo}_${studentName.replace(/\s+/g, '_')}_Report.pdf`);
};

// === 4. FORM EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#reportForm');
  const display = document.querySelector('#coachDisplay');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const studentName = document.querySelector('#studentName').value.trim();
      const admissionNo = document.querySelector('#admissionNo').value.trim();

      const marksMap = {};
      let hasError = false;

      SUBJECTS.forEach(sub => {
        const val = parseFloat(document.querySelector(`#${sub.key}`).value);
        if (isNaN(val) || val < 0 || val > 100) hasError = true;
        marksMap[sub.key] = val;
      });

      if (hasError || !studentName || !admissionNo) {
        alert("Please provide valid student details and marks between 0 and 100 for all subjects.");
        return;
      }

      const result = calculatePerformance(marksMap);
      logEntry(studentName, admissionNo, result);
      renderHistory();

      // Trigger automatic PDF download for parents/records
      generatePDFReport(studentName, admissionNo, marksMap, result);

      // Display success banner in UI
      display.style.display = "block";
      display.innerHTML = `
        <div style="font-weight:bold; color:#4ecca3;">Report Generated Successfully!</div>
        <div style="font-size:0.9rem; margin-top:0.4rem;">Student: ${studentName} | Mean: ${result.meanScore}% (${result.descriptor})</div>
      `;

      form.reset();
    });
  }

  renderHistory();
});
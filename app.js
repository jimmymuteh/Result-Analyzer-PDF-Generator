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

const sessionLog = [];

const calculatePerformance = (marksMap) => {
  let totalScore = 0;
  SUBJECTS.forEach(sub => {
    totalScore += Number(marksMap[sub.key] || 0);
  });

  const meanScore = totalScore / SUBJECTS.length;
  
  let descriptor = "Below Expectations";
  if (meanScore >= 75) descriptor = "Exceeding Expectation";
  else if (meanScore >= 55) descriptor = "Meeting Expectation";
  else if (meanScore >= 40) descriptor = "Approaching Expectation";

  return { totalScore: Math.round(totalScore), meanScore: meanScore.toFixed(1), descriptor };
};

const renderHistory = () => {
  const tableEl = document.querySelector('#historyTable');
  if (!tableEl) return;

  if (!sessionLog.length) {
    tableEl.innerHTML = '<tr><td colspan="5" style="color:#8b949e;text-align:center;padding:1rem;">No reports generated yet.</td></tr>';
    return;
  }
  
  // [NEW] Renders grade, stream, and term dynamically in the table
  tableEl.innerHTML = sessionLog.map(e => `
    <tr>
      <td><b>${e.studentName}</b> (${e.admissionNo})</td>
      <td>${e.grade} - Stream ${e.stream}</td>
      <td>${e.term}</td>
      <td>${e.meanScore}%</td>
      <td style="color:#4ecca3;font-weight:600;">${e.descriptor}</td>
    </tr>
  `).join('');
};

const generatePDFReport = (record) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RWANG'ONDU JUNIOR SCHOOL", 105, 18, { align: "center" });
  
  // [NEW] Includes grade, stream, and term inside the PDF header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`CBC ACADEMIC REPORT — ${record.grade} Stream ${record.stream} (${record.term})`, 105, 25, { align: "center" });
  doc.line(20, 30, 190, 30);

  doc.text(`Student Name: ${record.studentName}`, 20, 40);
  doc.text(`Admission No: ${record.admissionNo}`, 130, 40);

  let startY = 55;
  doc.setFillColor(30, 30, 30);
  doc.rect(20, startY, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Learning Area (Subject)", 25, startY + 6);
  doc.text("Score (/100)", 150, startY + 6);

  startY += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  SUBJECTS.forEach((sub, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, startY - 4, 170, 7, "F");
    }
    doc.text(sub.label, 25, startY);
    doc.text(String(record.marksMap[sub.key]), 160, startY);
    startY += 8;
  });

  startY += 5;
  doc.line(20, startY, 190, startY);
  startY += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Marks: ${record.totalScore} / 900`, 20, startY);
  doc.text(`Mean Score: ${record.meanScore}%`, 20, startY + 8);
  doc.text(`Overall Performance: ${record.descriptor}`, 20, startY + 16);

  doc.save(`${record.admissionNo}_${record.studentName.replace(/\s+/g, '_')}_${record.term}.pdf`);
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#reportForm');
  const csvInput = document.querySelector('#csvFileInput'); // [NEW] Reference to file input
  const display = document.querySelector('#coachDisplay');

  // Single Entry Form Handler
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const studentName = document.querySelector('#studentName').value.trim();
      const admissionNo = document.querySelector('#admissionNo').value.trim();
      
      // [NEW] Captures class parameters from form dropdowns
      const grade = document.querySelector('#selectGrade').value;
      const stream = document.querySelector('#selectStream').value;
      const term = document.querySelector('#selectTerm').value;

      const marksMap = {};
      SUBJECTS.forEach(sub => {
        marksMap[sub.key] = parseFloat(document.querySelector(`#${sub.key}`).value);
      });

      const result = calculatePerformance(marksMap);
      const record = { studentName, admissionNo, grade, stream, term, marksMap, ...result };
      
      sessionLog.push(record);
      renderHistory();
      generatePDFReport(record);

      display.style.display = "block";
      display.innerHTML = `<b style="color:#4ecca3;">Report generated for ${studentName} (${grade} Stream ${stream})!</b>`;
      form.reset();
    });
  }

  // [NEW] CSV BULK UPLOAD HANDLER (Allows multi-teacher entry processing)
  if (csvInput) {
    csvInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const cols = line.split(',').map(c => c.trim());
          if (cols.length < 14) continue;

          const [studentName, admissionNo, grade, stream, term, eng, kis, mat, sci, soc, cre, agr, pre, art] = cols;
          
          const marksMap = {
            sub_English: parseFloat(eng),
            sub_Kiswahili: parseFloat(kis),
            sub_Mathematics: parseFloat(mat),
            sub_Science: parseFloat(sci),
            sub_SocialStudies: parseFloat(soc),
            sub_CRE: parseFloat(cre),
            sub_Agriculture: parseFloat(agr),
            sub_PreTech: parseFloat(pre),
            sub_CreativeArts: parseFloat(art)
          };

          const result = calculatePerformance(marksMap);
          sessionLog.push({ studentName, admissionNo, grade, stream, term, marksMap, ...result });
          importedCount++;
        }

        renderHistory();
        display.style.display = "block";
        display.innerHTML = `<b style="color:#4ecca3;">Successfully imported ${importedCount} student records from CSV!</b>`;
        csvInput.value = "";
      };
      reader.readAsText(file);
    });
  }

  renderHistory();
});
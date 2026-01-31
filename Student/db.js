const DB_NAME = "StudentPortalDB";
const DB_VERSION = 1;
const STORE_NAME = "students";

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject("Could not open database");
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

async function addStudent(student) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Add timestamp and generated code if not provided
    student.dateEnrolled = new Date().toLocaleString();
    if (!student.studentCode) {
      student.studentCode =
        "56X00" + Math.floor(100000 + Math.random() * 900000);
    }

    const request = store.add(student);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error adding student");
  });
}

async function getAllStudents() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error fetching students");
  });
}

async function getStudent(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(Number(id));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error fetching student");
  });
}

async function updateStudent(student) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(student);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Error updating student");
  });
}

async function deleteStudent(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(Number(id));

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error deleting student");
  });
}

const SUBJECT_MAPPING = {
  '001': 'ENGLISH LANGUAGE',
  '020': 'SOCIAL STUDIES',
  '022': 'RELIGIOUS AND MORAL EDUCATION',
  '030': 'MATHEMATICS',
  '034': 'SCIENCE',
  '040': 'CAREER TECHNOLOGY',
  '041': 'CREATIVE ART AND DESIGN',
  '050': 'FANTE',
  '051': 'COMPUTING'
};

async function getFirstStudentWithNoScores() {
  const students = await getAllStudents();
  return students.find(s => {
    if (!s.scores || Object.keys(s.scores).length === 0) return true;
    return s.subjects.some(subjName => {
      const code = Object.keys(SUBJECT_MAPPING).find(k => SUBJECT_MAPPING[k] === subjName) || subjName;
      const score = s.scores[code];
      return !score || !score.year1 || !score.year2 || score.year1 === '000' || score.year2 === '000';
    });
  });
}

function handleEnterCass() {
  getFirstStudentWithNoScores().then(student => {
    if (student) {
      window.location.href = `CassScoreEntry.html?id=${student.id}`;
    } else {
      console.log("No students with missing CASS scores found.");
    }
  });
}

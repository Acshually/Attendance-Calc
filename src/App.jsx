import React, { useState, useEffect } from 'react';

// --- Configuration ---
// These are the initial values for the attendance calculation.
// const INITIAL_TOTAL_CLASSES = 250;
// const INITIAL_ATTENDED_CLASSES = 220;
// --- End Configuration ---

// Main App Component
export default function App() {
  // State for the fetched data from your API
  const [metadata, setMetadata] = useState(null);
  const [classes, setClasses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getSelectedCourse = () => {return JSON.parse(localStorage.getItem('selectedCourse'))}
  const getSelectedSemester = () => {return JSON.parse(localStorage.getItem('selectedSemester'))}
  const getSelectedBatch = () => {return JSON.parse(localStorage.getItem('selectedBatch'))}

  // State for user's dropdown selections
  const [selectedCourse, setSelectedCourse] = useState(getSelectedCourse);
  const [selectedSemester, setSelectedSemester] = useState(getSelectedSemester);
  const [selectedBatch, setSelectedBatch] = useState(getSelectedBatch);

  const setData= () =>{
    if(selectedBatch && selectedCourse && selectedSemester){
    localStorage.setItem('selectedCourse',JSON.stringify(selectedCourse))
    localStorage.setItem('selectedSemester',JSON.stringify(selectedSemester))
    localStorage.setItem('selectedBatch',JSON.stringify(selectedBatch))}
  }

  // State to hold the derived timetable for the selected batch
  const [currentTimetable, setCurrentTimetable] = useState(null);

  // --- Data Fetching ---
  // On the initial component mount, fetch the data from your local server.
  useEffect(() => {
    async function fetchData() {
      try {
        // Assuming your Node.js server is running on localhost:3000
        const response1 = await fetch('https://raw.githubusercontent.com/codelif/jiit-planner-cdn/refs/heads/main/metadata.json');
        const response2 = await fetch('https://raw.githubusercontent.com/codelif/jiit-planner-cdn/refs/heads/main/classes.json');
        if (!response1.ok && !response2.ok) {
          throw new Error(`HTTP error! Status: ${response.status}. Make sure your local server is running.`);
        }
        const data1 = await response1.json();
        const data2 = await response2.json();
        setMetadata(data1);
        setClasses(data2);
        console.log(classes);
        
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []); // Empty array means this effect runs only once on mount

  // --- Timetable Derivation ---
  // This effect runs whenever the user's selection changes.
  useEffect(() => {
    // We can only find the timetable if all selections are made and the data is loaded.
    if (selectedCourse && selectedSemester && selectedBatch && classes) {
      // The JSON data seems to have a hardcoded 'phase1', so we'll use that.
      const timetableKey = `${selectedCourse}_${selectedSemester}_phase1_${selectedBatch}`;
      
      const foundTimetable = classes[timetableKey];
      setCurrentTimetable(foundTimetable ? foundTimetable.classes : null);
    } else {
      setCurrentTimetable(null);
    }
    setData();
  }, [selectedCourse, selectedSemester, selectedBatch, classes]);

  // --- Dropdown Options ---
  // These are memoized for performance, so they don't recalculate on every render.
  const courseOptions = metadata?.courses || [];
  const semesterOptions = selectedCourse ? metadata?.semesters[selectedCourse] || [] : [];
  const batchOptions = selectedCourse && selectedSemester ? metadata?.batches[selectedCourse]?.[selectedSemester]?.phase1 || [] : [];

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-2xl font-semibold">Loading data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 text-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
        <p className="text-lg">{error}</p>
        <p className="mt-4 text-sm">Please ensure your local Node.js server (from the previous step) is running on `http://localhost:3000`.</p>
      </div>
    </div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">University Timetable & Attendance Calculator</h1>
          <p className="text-md text-gray-600 mt-2">Select your course, semester, and batch to view your schedule and calculate attendance.</p>
        </header>

        {/* --- Selection Controls --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-white rounded-xl shadow-md">
          {/* Course Dropdown */}
          <div>
            <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSemester(''); // Reset dependent selections
                setSelectedBatch('');
              }}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Course --</option>
              {courseOptions.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              id="semester-select"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedBatch(''); // Reset batch selection
              }}
              disabled={!selectedCourse}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            >
              <option value="">-- Select Semester --</option>
              {semesterOptions.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
            </select>
          </div>

          {/* Batch Dropdown */}
          <div>
            <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!selectedSemester}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            >
              <option value="">-- Select Batch --</option>
              {batchOptions.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </select>
          </div>
        </div>

        {/* --- Timetable Display --- */}
        {currentTimetable ? (
          <TimetableCalculator timetable={currentTimetable} />
        ) : (
          <div className="text-center p-10 bg-white rounded-xl shadow-md">
            <p className="text-lg text-gray-500">Please make your selections above to display the timetable.</p>
          </div>
        )}
      </div>
    </div>
  );
}


// --- Timetable Calculator Component ---
// This component now receives the timetable data as a prop
function TimetableCalculator({ timetable }) {
  const [skippedClasses, setSkippedClasses] = useState({});
  const [attendance, setAttendance] = useState({
    percentage: (0) * 100,
    skippedCount: 0,
  });
  
  // --- ADD THIS ---
  // New state to hold the names of the skipped classes
  const [skippedClassNames, setSkippedClassNames] = useState([]);
  // --- END ADD ---


  // Re-initialize the `skippedClasses` state whenever a new timetable is passed in.
  useEffect(() => {
    const initialSkipped = {};
    if (timetable) {
      Object.keys(timetable).forEach(day => {
        initialSkipped[day] = Array(timetable[day].length).fill(false);
      });
    }
    setSkippedClasses(initialSkipped);
    // Also reset the names when the timetable changes
    setSkippedClassNames([]); 
  }, [timetable]);

  // --- UPDATE THIS ENTIRE EFFECT ---
  // Recalculate attendance AND the list of names whenever `skippedClasses` changes.
  useEffect(() => {
    let currentSkippedCount = 0;
    const newSkippedNames = []; // Create a temporary array to build the list

    // Iterate over each day in our state (e.g., "Monday")
    Object.keys(skippedClasses).forEach(day => {
      // Iterate over the boolean array for that day (e.g., [false, true, false])
      skippedClasses[day].forEach((isSkipped, periodIndex) => {
        if (isSkipped) {
          currentSkippedCount++;
          
          // If skipped, find the corresponding class info from the prop
          const classInfo = timetable[day]?.[periodIndex];
          if (classInfo && classInfo.subjectcode) {
            newSkippedNames.push(classInfo.subject.toLowerCase()); // Add the subject name
          }
        }
      });
    });

    // const newTotal = INITIAL_TOTAL_CLASSES; // Total classes doesn't change
    // const newAttended = INITIAL_ATTENDED_CLASSES - currentSkippedCount;
    // const newPercentage = newTotal > 0 ? (newAttended / newTotal) * 100 : 0;

    // setAttendance({
    //   percentage: newPercentage,
    //   skippedCount: currentSkippedCount,
    // });
    
    // Set the new state with the array of names
    setSkippedClassNames(newSkippedNames);

  }, [skippedClasses, timetable]); // Add `timetable` to the dependency array
  // --- END UPDATE ---

  const handleClassClick = (day, periodIndex) => {
    const newSkippedState = { ...skippedClasses };
    newSkippedState[day][periodIndex] = !newSkippedState[day][periodIndex];
    setSkippedClasses(newSkippedState);
  };

  const handleDayClick = (day) => {
    const isAllSelected = skippedClasses[day]?.every(skipped => skipped);
    const newSkippedState = { ...skippedClasses };
    newSkippedState[day] = newSkippedState[day].map(() => !isAllSelected);
    setSkippedClasses(newSkippedState);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const presentDays = daysOfWeek.filter(day => timetable[day] && timetable[day].length > 0);
  const maxPeriods = Math.max(0, ...Object.values(timetable).map(day => day.length));


  const getInitialState=()=>{
    const savedReport = localStorage.getItem('attendanceReport');
    if(savedReport){
      try {
        return JSON.parse(savedReport)
      } catch (error) {
        console.error("Failed to parse attendance report", e);
        return {};
      }
    }
    return {};
  };

  // --- FIX 1: Add new state to hold the fetched attendance report ---
  const [attendanceReportData, setAttendanceReportData] = useState(getInitialState);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [username, setUsername] = useState(() => localStorage.getItem('attendanceUsername') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('attendancePassword') || '');

  useEffect(() => {
    localStorage.setItem('attendanceUsername', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('attendancePassword', password);
  }, [password]);


  useEffect(()=>{
    // if(attendanceReportData)
    localStorage.setItem('attendanceReport',JSON.stringify(attendanceReportData));
  },[attendanceReportData])

  // useEffect(()=>{
  //   localStorage.
  // },[])

  // --- FIX 2: Update the fetchAttendance function ---
  async function fetchAttendance() {
    setIsFetching(true);
    setFetchError(null);
    setAttendanceReportData(null); // Clear old results
    
    const loginDetails = {
      username:username,
      password:password
      
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URI}/api/get-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginDetails) // Send data in the body
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success:", data.attendance);
        // --- THIS IS THE KEY ---
        // Instead of calling <AttaFunc>, you SET THE STATE.
        setAttendanceReportData(data.attendance);
      } else {
        console.error("Error:", data.error);
        setFetchError(data.error || "An unknown error occurred.");
      }
      
    } catch (error) {
      console.error("Network error:", error);
      setFetchError("Network error. Could not connect to the API.");
    } finally {
      setIsFetching(false);
    }
  }  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">select classes u'll skip in future (select day to skip all classes on that day)</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-3">
            
            
        </div>
        

        
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 font-semibold text-gray-600 border">Period</th>
              {presentDays.map(day => (
                <th key={day} onClick={() => handleDayClick(day)} className="p-3 font-semibold text-gray-600 border cursor-pointer hover:bg-gray-200 transition-colors">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxPeriods }).map((_, periodIndex) => (
              <tr key={periodIndex} className="odd:bg-white even:bg-gray-50">
                <td className="p-3 border font-medium text-gray-500">Period {periodIndex + 1}</td>
                {presentDays.map(day => {
                  const period = timetable[day]?.[periodIndex];
                  const isSkipped = skippedClasses[day]?.[periodIndex];

                  if (!period) {
                    return <td key={`${day}-${periodIndex}`} className="p-3 border"></td>;
                  }

                  return (
                    <td
                      key={`${day}-${periodIndex}`}
                      onClick={() => handleClassClick(day, periodIndex)}
                      className={`p-3 border cursor-pointer transition-all duration-200 ${isSkipped ? 'bg-red-200 text-red-800 line-through scale-95' : 'hover:bg-indigo-100'}`}
                    >
                      <div className="font-semibold">{period.subject}</div>
                      <div className="text-sm text-gray-500">{period.teacher}</div>
                      <div className="text-xs text-indigo-600 font-mono">{`${period.start} - ${period.end}`}</div>
                      <div className="text-xs text-gray-400">{`[${period.venue}] - ${period.type}`}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        {/* --- ADD THIS SECTION --- */}
        {/* Display the list of skipped classes */}
        {skippedClassNames.length > 0 && (
          <div className="mt-4 text-sm text-gray-700">
            <p className="font-semibold">Selected classes to skip:</p>
            <p className="text-red-600 px-4">
              {/* Join the array of names with a comma */}
              {skippedClassNames.join(", ")}
            </p>
          </div>
        )}
        {/* --- END ADD --- */}
      </div>

      {/* --- Section for Fetching Real Attendance --- */}
      <div className="mt-8 border-t pt-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Fetch Real Attendance</h2>
        <p className="text-gray-600 mb-4">
          Click the button to re-fetch your official attendance record. <br />
          input for username and pass in the bottom (have to enter first time only)
        </p>
        <button 
          onClick={fetchAttendance}
          disabled={isFetching}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50"
        >
          {isFetching ? 'Fetching...' : 'Fetch Attendance'}
        </button>

        {/* --- FIX 3: Conditionally render the results --- */}
        {isFetching && <div className="mt-4 text-blue-600">Loading attendance report...</div>}
        
        {fetchError && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            <strong>Error:</strong> {fetchError}
          </div>
        )}

        {/* If 'attendanceReportData' is not null, render the AttaFunc component */}
        {attendanceReportData && (
          <div className="mt-8">
            <AttaFunc data={attendanceReportData} skippedClasses={skippedClassNames}/>
          </div>
        )}
      </div>

      <div>
        <input type="text" value={username} placeholder='user id' onChange={(e)=>setUsername(e.target.value)}/>
        <input type="password" value={password} placeholder='password' onChange={(e)=>setPassword(e.target.value)}/>
      </div>
    </div>

    
  );
}

const safeParseInt = (value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  // Use parseFloat to handle potential decimals, then floor it,
  // or just use parseInt. parseInt is fine here.
  return parseInt(value, 10) || 0;
};

function AttaFunc(props) {
  // Get the data from props
  const attendanceData = props.data;
  let availableSkips = [...props.skippedClasses];
  
  // console.log('fala',attendanceData.studentattendancelist.individualsubjectcode);
  // attendanceData.studentattendancelist.map(i=>{
  //   console.log('subject code:',i.subjectcode);
    
  // })
  
  console.log('s1: ',availableSkips);

  

  if (!attendanceData || !attendanceData.studentattendancelist) {
    return <div>No attendance data to display.</div>;
  }
  
  const list = attendanceData.studentattendancelist;

  return (
    // We remove min-h-screen here as it's now embedded
    <div className="bg-gray-100 font-sans p-4 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Attendance Report
        </h1>
        <h2 className="text-xl text-gray-600 mb-8">
          Semester {attendanceData.currentSem}
        </h2>

        {/* --- The loop --- */}
        <div className="space-y-4">
          {list.map((subject) => {
            
            let skip = 0;
            // if(subject.individualsubject.toLowerCase()==skippedClassNames){skippedClasses++;}
            const fullName = subject.subjectcode.toLowerCase();
            const parts = fullName.split('(',1);
            const firstPart = parts[0].trim();
            console.log('firstPart: ',firstPart);
            
            // const index = skippedClasses.indexOf(firstPart);
            // if(index != -1){
            //   skip++;
            //   skippedClasses.splice(index,1);
            //   console.log('Array after removing one apple:', skippedClasses);
            // } else {
            //   console.log('Item not found in the array.');
            // }

            let index;
            while((index = availableSkips.indexOf(firstPart))!== -1){
              skip++;
              availableSkips.splice(index,1);
            }
            
            
            // Calculation logic
            const totalClasses =
              safeParseInt(subject.Ltotalclass) +
              safeParseInt(subject.Ttotalclass) +
              safeParseInt(subject.Ptotalclass)+
              skip;

            const totalPresent =
              safeParseInt(subject.Ltotalpres) +
              safeParseInt(subject.Ttotalpres) +
              safeParseInt(subject.Ptotalpres);
            
            const overallPercentage = (totalClasses > 0) 
              ? (totalPresent / totalClasses) * 100 
              : 0; // Avoid division by zero

            return (
              <div key={subject.slno} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                
                <h3 className="text-s font-semibold text-blue-700">
                  {subject.subjectcode}
                </h3>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                  
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <div className="text-l font-bold text-gray-800">
                        {totalPresent} / {totalClasses}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        Classes Attended
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 text-right">
                    <div className={`text-4xl font-extrabold ${overallPercentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {overallPercentage.toFixed(2)}%
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Overall
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Breakdown:</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-xs text-gray-500">Lecture (L)</span>
                      <p className="font-medium text-gray-800">
                        {safeParseInt(subject.Ltotalpres)} / {safeParseInt(subject.Ltotalclass)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tutorial (T)</span>
                      <p className="font-medium text-gray-800">
                        {safeParseInt(subject.Ttotalpres)} / {safeParseInt(subject.Ttotalclass)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Practical (P)</span>
                      <p className="font-medium text-gray-800">
                        {safeParseInt(subject.Ptotalpres)} / {safeParseInt(subject.Ptotalclass)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Skip</span>
                      <p className="font-medium text-gray-800">
                        {skip}
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

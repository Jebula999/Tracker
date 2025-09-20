import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Track from './Track';
import Journal from './Journal';
import Flags from './Flags';
import SleepFlow from './SleepFlow';
import { saveEntry } from './localStorageHelpers';
import { trackerData } from './dataSchema';
import Notification from './Components/Notification';

function App() {
  const [page, setPage] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectCategory, setSelectCategory] = useState(null);
  const [selectSubcategory, setSelectSubcategory] = useState(null);
  const [nextBranchPath, setNextBranchPath] = useState([]);  // for nested “next” chain
  const [sleepType, setSleepType] = useState(null);
  const [notif, setNotif] = useState({ message: "", visible: false });

  const showNotification = (msg) => {
    setNotif({ message: msg, visible: true });
    setTimeout(() => {
      setNotif({ message: "", visible: false });
    }, 1500);
  };

  const navigateTo = (to, data = {}) => {
    setPage(to);
    if (["Dashboard", "Track", "Journal", "Flags"].includes(to)) {
      setActiveTab(to);
    }
    if ("categoryKey" in data) setSelectCategory(data.categoryKey);
    else setSelectCategory(null);
    if ("subcategory" in data) setSelectSubcategory(data.subcategory);
    else setSelectSubcategory(null);
    if ("nextPath" in data) setNextBranchPath(data.nextPath);
    else setNextBranchPath([]);
  };

  const handleLeafOption = (categoryKey, option, subcategory = null, nestedPath = []) => {
    const entry = {
      timestamp: Date.now(),
      category: categoryKey,
      subcategory: subcategory,
      option: option,
      data: {}  // leaf has no further data
    };
    showNotification("Success");
    saveEntry(entry);
    setPage("Dashboard");
    setSelectCategory(null);
    setSelectSubcategory(null);
    setNextBranchPath([]);
  };

  return (
    <div className="app-container">
      <main className="content">
        {page === "Dashboard" && <Dashboard navigateTo={navigateTo} />}

        {page === "SelectSleepType" && (
          <div className="select-sleep-type">
            <h2>Sleep – select type</h2>
            <ul>
              <li>
                <button onClick={() => { setSleepType("Nap"); setPage("SleepFlow"); }}>
                  Nap
                </button>
              </li>
              <li>
                <button onClick={() => { setSleepType("Last Night"); setPage("SleepFlow"); }}>
                  Last Night
                </button>
              </li>
            </ul>
          </div>
        )}

        {page === "SleepFlow" && sleepType && (
          <SleepFlow
            onDone={() => { setPage("Dashboard"); setSleepType(null); }}
            sleepType={sleepType}
            showNotif={showNotification}
          />
        )}

        {page === "SelectOption" && selectCategory && (
          <div className="select-option">
            <h2 style={{ textAlign: 'center' }}>{selectCategory}</h2>
            <ul>
              {(() => {
                const catObj = trackerData[selectCategory];
                if (catObj && catObj.options == null) {
                  // has subcategories
                  return Object.keys(catObj).map((sub, idx) => (
                    <li key={idx}>
                      <button onClick={() =>
                        navigateTo("SelectOptionWithSub", {
                          categoryKey: selectCategory,
                          subcategory: sub
                        })
                      }>
                        {sub}
                      </button>
                    </li>
                  ));
                } else {
                  // direct options
                  return catObj.options.map((opt, idx) => {
                    if (typeof opt === "object" && opt.input === "text") {
                      return (
                        <li key={idx}>
                          <button onClick={() => {
                            const val = window.prompt("Enter text:");
                            if (val) handleLeafOption(selectCategory, val, null);
                          }}>
                            {opt.label}
                          </button>
                        </li>
                      );
                    } else {
                      return (
                        <li key={idx}>
                          <button onClick={() =>
                            handleLeafOption(selectCategory, opt, null)
                          }>
                            {opt}
                          </button>
                        </li>
                      );
                    }
                  });
                }
              })()}
            </ul>
          </div>
        )}

        {page === "SelectOptionWithSub" && selectCategory && selectSubcategory && (
          <div className="select-option">
            <h2 style={{ textAlign: 'center' }}>{selectCategory}</h2>
            <ul>
              {(() => {
                const subObj = trackerData[selectCategory][selectSubcategory];
                // If nested "next" exists, detect which leaf
                if (subObj.next) {
                  // Options first
                  return subObj.options.map((opt, idx) => {
                    if (typeof opt === "object" && opt.input === "text") {
                      return (
                        <li key={idx}>
                          <button onClick={() => {
                            const val = window.prompt("Enter text:");
                            if (val) handleLeafOption(selectCategory, val, selectSubcategory);
                          }}>
                            {opt.label}
                          </button>
                        </li>
                      );
                    } else {
                      if (subObj.next[opt]) {
                        // drill further
                        return (
                          <li key={idx}>
                            <button onClick={() =>
                              navigateTo("SelectOptionNext", {
                                categoryKey: selectCategory,
                                subcategory: selectSubcategory,
                                nextKey: opt
                              })
                            }>
                              {opt}
                            </button>
                          </li>
                        );
                      } else {
                        return (
                          <li key={idx}>
                            <button onClick={() =>
                              handleLeafOption(selectCategory, opt, selectSubcategory)
                            }>
                              {opt}
                            </button>
                          </li>
                        );
                      }
                    }
                  });
                } else {
                  // no nested next, leaf at this level
                  return subObj.options.map((opt, idx) => {
                    if (typeof opt === "object" && opt.input === "text") {
                      return (
                        <li key={idx}>
                          <button onClick={() => {
                            const val = window.prompt("Enter text:");
                            if (val) handleLeafOption(selectCategory, val, selectSubcategory);
                          }}>
                            {opt.label}
                          </button>
                        </li>
                      );
                    } else {
                      return (
                        <li key={idx}>
                          <button onClick={() =>
                            handleLeafOption(selectCategory, opt, selectSubcategory)
                          }>
                            {opt}
                          </button>
                        </li>
                      );
                    }
                  });
                }
              })()}
            </ul>
          </div>
        )}

        {page === "SelectOptionNext" && (() => {
          // This handles deeper "next" branches (like Food -> Breakfast -> Takeout -> specific Takeout options)
          // We need state to remember nextKey etc. For simplicity below:
          const nb = nextBranchPath; // not fully implemented path storage, but outline
          const data = {}; // placeholder
          // Could implement similar patterns: find schema node via trackerData and nb
          return (
            <div className="select-option">
              <h2>More options</h2>
              <ul>
                <li><button onClick={() => {
                  // placeholder: leaf handling
                  handleLeafOption(selectCategory, "placeholder", selectSubcategory);
                }}>Placeholder Option</button></li>
              </ul>
            </div>
          );
        })()}

        {page === "Track" && <Track />}

        {page === "Journal" && <Journal />}

        {page === "Flags" && <Flags />}
      </main>

      <footer className="tab-footer">
        <button className={activeTab === 'Dashboard' ? 'active' : ''} onClick={() => navigateTo("Dashboard")}>Dashboard</button>
        <button className={activeTab === 'Track' ? 'active' : ''} onClick={() => navigateTo("Track")}>Track</button>
        <button className={activeTab === 'Journal' ? 'active' : ''} onClick={() => navigateTo("Journal")}>Journal</button>
        <button className={activeTab === 'Flags' ? 'active' : ''} onClick={() => navigateTo("Flags")}>Flags</button>
      </footer>

      <Notification message={notif.message} visible={notif.visible} />
    </div>
  );
}

export default App;

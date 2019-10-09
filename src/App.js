import React, { useState, useEffect } from "react";
import "./App.css";

function customFetch(url) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: process.env.REACT_APP_API_GITHUB
    }
  });
}

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    // get user's repository names
    const repoList = await customFetch(
      "https://api.github.com/user/repos"
    ).then(async res => {
      const reposInfo = await res.json();
      return reposInfo.map(repo => repo.name);
    });

    const resultSet = [0, 0, 0, 0, 0, 0, 0];

    await Promise.all(
      repoList.map(async repo => {
        await customFetch(
          `https://api.github.com/repos/devohno/${repo}/stats/commit_activity`
        ).then(async res => {
          const repoActivity = await res.json();

          // Get current week activity
          const repoDayActivity = repoActivity[51].days;

          // reflection
          await Promise.all(
            repoDayActivity.map((day, idx) => {
              resultSet[idx] += day;
            })
          );
        });
      })
    );

    console.log(resultSet);
    setData(resultSet);
    setLoading(false);
  }
  useEffect(() => {
    setLoading(true);
    setTimeout(() => fetchData(), 2000);
  }, []);

  return (
    <div className="App">
      <div className="App__container">
        {!loading ? <GitActivityDisplay data={data} /> : <LoadingIndicator />}
      </div>
    </div>
  );
}

const LoadingIndicator = () => {
  const [view, setView] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setView(!view), 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [view]);
  return (
    <div style={styles.loadingWrapper}>
      <img
        src={require("./loading.png")}
        alt="loading"
        style={styles.loadingImg}
      />
      <p style={{ visibility: view ? "visible" : "hidden" }}>
        Github is now loading...
      </p>
    </div>
  );
};

const GitActivityDisplay = ({ data }) => {
  return (
    <div className="Content__wrapper">
      <div style={styles.container}>
        {data.map((item, idx) => {
          let boxColor = "";
          switch (item) {
            case 0:
              boxColor = "#ebedf0";
              break;
            case 1:
            case 2:
              boxColor = "#c6e48b";
              break;
            case 3:
            case 4:
              boxColor = "#7bc96f";
              break;
            case 5:
            case 6:
              boxColor = "#239a3b";
              break;
            default:
              boxColor = "#196127";
              break;
          }
          return (
            <div key={idx} style={{ ...styles.day, backgroundColor: boxColor }}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "inherit",
    height: "inherit"
  },
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    color: "#272C34",
    fontStyle: "italic"
  },
  loadingImg: {
    width: 50,
    height: 50,
    marginRight: 10
  },
  day: {
    width: "inherit",
    height: "inherit",
    border: "2px solid white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 15,
    fontWeight: "600"
  }
};

export default App;

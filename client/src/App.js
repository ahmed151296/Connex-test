import React, { useEffect, useState } from 'react';

function App() {
  const [time, setTime] = useState({});
  const [metricsData, setMetricsData] = useState({});
  const [timeDifference, setTimeDifference] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  const apiUrlTime = '/getServerTime';
  const apiUrlMetrics = '/metrics';
  const authToken = `cd`; // Replace with your actual authorization token

  useEffect(() => {
    // Function to fetch data from /time and /metrics
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true while fetching data

      try {
        // Fetch server time
        const responseTime = await fetch(apiUrlTime, {
          headers: {
            Authorization: authToken,
          },
        });
        const timeData = await responseTime.json();

        // Fetch metrics data
        const responseMetrics = await fetch(apiUrlMetrics, {
          headers: {
            Authorization: authToken,
          },
        });
        const metrics = await responseMetrics.text(); // Assuming metrics data is in text format

        // Calculate time difference
        const serverTimeInSeconds = timeData.epoch;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const differenceInSeconds = currentTimeInSeconds - serverTimeInSeconds;

        // Function to format seconds as HH:mm:ss
        const formatTimeDifference = (seconds) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const remainingSeconds = seconds % 60;
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        };

        // Update state with fetched data and set loading to false
        setTime(timeData);
        setTimeDifference(differenceInSeconds);
        setMetricsData(metrics);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); // Set loading to false in case of an error
      }
    };

    // Fetch data when the component mounts
    fetchData();

    // Set up a timer to fetch data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);

    // Cleanup interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div>
        <p>Server Time (Epoch Seconds): {time.epoch}</p>
        <p>Time Difference: {timeDifference}</p>
      </div>
      <div>
        {isLoading ? (
          // Display loading indicator when data is being fetched
          <div>Loading...</div>
        ) : (
          // Display metrics data when it's available
          <pre>{metricsData}</pre>
        )}
      </div>
    </div>
  );
}

export default App;

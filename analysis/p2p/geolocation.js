// const geolocation = require('node-geolocation');

// geolocation((err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(data);
//   }
// });

const request = require('request');
const ip = '8.8.8.8'; // 要查询的 IP 地址
request(`https://ipapi.co/${ip}/latlong/`, (error, response, body) => {
  if (error) {
    console.error(error);
    return;
  }
  if (response.statusCode !== 200) {
    console.error(`Failed to get geolocation for ${ip}, status code: ${response.statusCode}`);
    return;
  }
  const [latitude, longitude] = body.split(',');
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
});
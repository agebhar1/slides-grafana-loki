import { check, sleep } from 'k6';
import loki from 'k6/x/loki';

const KB = 1024;
const MB = KB * KB;

export const options = {
  vus: 1,
};

const labels = loki.Labels({
  // apache_common, apache_combined, apache_error, rfc3164, rfc5424, json, logfmt
  "format": [`${__ENV.FORMAT}`],
  // darwin, linux, windows
  "os": ["linux"],
  "app": ["k6"]
});

let conf = loki.Config("http://fake@localhost:3100", 10000, 0.9, {}, labels);
let client = loki.Client(conf);

export default function () {
  // Push a batch of 2 streams with a payload size between 500KB and 1MB
  let res = client.pushParameterized(2, 512 * KB, 1 * MB);
  check(res, { 'successful write': (res) => res.status == 204 });
  sleep(1);
}

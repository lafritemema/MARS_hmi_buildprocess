import * as utils from './utils.js';
import bs from './bp.json' assert { type: "json" };

const acgen = utils.actionGenerator(bs.buildProcess);

for(const a of acgen) {
  console.log(a)
}

const regeneratorRuntime = require('regenerator-runtime'); // to make async/await working
import { GridStack } from '../../../../../gridstack/dist/gridstack';

const keyboard = document.querySelector('.keyboard');

keyboard.innerHTML = `
  <textarea class="keyboard__input input" placeholder=""></textarea>
  <div class="keys keyboard__keys grid-stack unselectable"></div>
`;

// an object we link gridstack to
const keys = document.querySelector('.keys');
const keysList = keys.children;
const input = document.querySelector('.input');

const options = {
  // cellHeight: 40,
  // cellWidth: 40,
  // verticalMargin: 0,
  // height: 0,
  // width: 50,
  margin: 6,
  disableOneColumnMode: true,
  column: 22,
  staticGrid: true,
  disableResize: true,
};

const url = '../server/gs-keyboard-layout.json';
let gsParsedData = []; // an array for parsed json gridstack objects

const fetchKeyboardLayout = async () => {
  try {
    const res = await fetch(url);
    gsParsedData = await res.json();
  } catch (e) {
    console.error(e);
  }
};

const loadGridStack = () => {
  GridStack.init(options, keys).load(gsParsedData);
};

const manageLayout = () => {
  for (let i = 0; i < keysList.length; i++) {
    // adding special classes to be able to style keyboard keys
    const itemContent = keysList[i].querySelector('.grid-stack-item-content');

    // ? maybe it's better to test .className by regex first (to be sure it only contains words splited by spacebars)
    // ? if it contains ',' then replace it by ' '
    const classList = gsParsedData[i].className.split(' ');
    itemContent.classList.add(...classList.filter((el) => el != ''));

    const letter = document.createElement('div');
    letter.className = 'key__letter letter';
    letter.innerHTML = gsParsedData[i].keyContent;
    itemContent.append(letter);
  }
}

const handleClick = () => {
  keys.addEventListener('click', (e) => {
    const gsItem = e.target.closest('.grid-stack-item');
    const isKey = e.target.closest('.key'); // check if a key (.grid-stack-item-content) was pressed (not only .grid-stack-item)
    if (isKey) {
      const gsItemIndex = [...keysList].indexOf(gsItem);
      const key = gsItem.querySelector('.key');
      if (key) {
        switch (gsParsedData[gsItemIndex].action) {
          case 'input': {
            const letter = key.querySelector('.letter');
            // input.append(letter.innerHTML); // this leads to a bug (you won't be able to type again after an input clear)
            // or
            input.value += letter.innerHTML;
            break;
          }
          case 'linebreak': {
            input.value += '\n';
            break;
          }
          case 'backspace': {
            input.value = input.value.slice(0, -1);
            break;
          }
        }

        input.focus();
      }
    }
  });
}

fetchKeyboardLayout().then(loadGridStack).then(manageLayout).then(handleClick);
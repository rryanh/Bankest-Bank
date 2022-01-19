'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-01-03T23:36:17.929Z',
    '2022-01-04T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];
let currentAccount = null;
let sortState = false;

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
const date = new Date();
const dateTimeOptions = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
};
labelDate.textContent = new Intl.DateTimeFormat(
  'en-CA',
  dateTimeOptions
).format(date);

// Functions
const formatMovementDate = function (date, local) {
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  const daysPassed = calcDateDifference(new Date(), date);
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed === 0) return 'Today';
  return Intl.DateTimeFormat(local).format(date);
};

const getUserNames = function (accounts) {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

const calcDateDifference = function (date1, date2) {
  return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
};

getUserNames(accounts);
const tick = function () {
  let time = 600;
  let min = Math.floor(time / 60);
  let sec = (time % 60).toString().padStart(2, 0);
  labelTimer.textContent = `${min}:${sec}`;
  if (time === 0) {
    clearInterval(timer);
    containerApp.style.opacity = 0;
  }
  time--;
};

const startLogOutTimer = function () {
  tick();
  let time = 600;

  const timer = setInterval(function () {
    let min = Math.floor(time / 60);
    let sec = (time % 60).toString().padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    time--;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
    }
  }, 1000);
  return timer;
};

let timer;
const performedAction = function () {
  clearInterval(timer);
  timer = startLogOutTimer();
};
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  const username = inputLoginUsername.value;
  const pin = inputLoginPin.value;
  currentAccount = accounts.find(
    acc => acc.username === username && acc.pin === +pin
  );
  if (currentAccount) {
    performedAction();
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome ${currentAccount.owner}`;
    calcDisplayBalance(currentAccount);
    displayMovements(currentAccount);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    labelDate.textContent = new Intl.DateTimeFormat(
      'en-CA',
      dateTimeOptions
    ).format(date);
  } else {
    containerApp.style.opacity = 0;
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  performedAction();
  const to = inputTransferTo.value;
  const amount = inputTransferAmount.value;
  const receiverAccount = accounts.find(acc => acc.username === to);
  if (
    +amount > 0 &&
    +amount <= currentAccount.balance &&
    accounts.find(acc => acc.username === to)
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(+amount);
    inputTransferAmount.value = '';
    inputTransferAmount.blur();
    inputTransferTo.value = '';
    inputTransferTo.blur();
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  performedAction();
  const username = inputCloseUsername.value;
  const pin = inputClosePin.value;
  if (currentAccount.username === username && currentAccount.pin === +pin) {
    inputCloseUsername.blur();
    inputClosePin.blur();
    inputCloseUsername.value = inputClosePin.value = '';

    const index = accounts.findIndex(acc => {
      console.log(acc.username, currentAccount.username);
      return acc.username === currentAccount.username;
    });

    if (index !== -1) {
      accounts.splice(index, 1);
    }
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  performedAction();
  const amount = Math.floor(+inputLoanAmount.value);
  if (
    +amount > 0 &&
    currentAccount.movements.some(mov => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(+amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    setTimeout(function () {
      updateUI(currentAccount);
    }, 2000);
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
  }
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sortState = !sortState;
  displayMovements(currentAccount, sortState);
});

// /////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
const updateUI = function (account) {
  displayMovements(account);
  calcDisplayBalance(account);
};

const calcDisplayBalance = function (account) {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);

  const spending = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);

  const interest = (((income + spending) * account.interestRate) / 100).toFixed(
    1
  );

  labelBalance.textContent = `${getLocalCurrency(
    (income + spending).toFixed(2),
    account.locale,
    account.currency
  )}`;
  labelSumIn.textContent = `${getLocalCurrency(
    income.toFixed(2),
    account.locale,
    account.currency
  )}`;
  labelSumOut.textContent = `${getLocalCurrency(
    spending.toFixed(2),
    account.locale,
    account.currency
  )}`;
  labelSumInterest.textContent = `${getLocalCurrency(
    interest,
    account.locale,
    account.currency
  )}`;
  account.balance = income + spending;
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach((mov, i) => {
    const displayDate = formatMovementDate(
      new Date(account.movementsDates[i]),
      account.locale
    );
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">
      ${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${getLocalCurrency(
        mov,
        account.locale,
        account.currency
      )}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const getLocalCurrency = function (val, local, currency) {
  return new Intl.NumberFormat(local, {
    style: 'currency',
    currency: currency,
  }).format(val);
};

// stuff from the videos;

// get obj with sum of deposits and withdrawals

//debug

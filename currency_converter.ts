#!/usr/bin/env node

import inquirer from "inquirer"
import chalk from "chalk"
import showBanner from "node-banner";
import { createSpinner } from "nanospinner"

// interface for the currency data
interface DataType {
    [key: string]: number;
};

// Fetch currency data from the API
let spinner = createSpinner("fetching Data...").start();

let data = await fetch("https://openexchangerates.org/api/latest.json?app_id=a9757a6024064847b3697bcdcc01de98")
    .then(response => response.json())
    .then(currRates => currRates.rates);

spinner.stop({text: "Data fetched successfully", color: "green"})

// Type alias for object keys
type objectKey = keyof DataType;

// function to create a delay
let wait = (time: number = 2000) => new Promise((r) => setTimeout(r, time));

// Function to display the banner
let ShowBanner = async (): Promise<void> => {
    await showBanner(
        "Currency Converter",
        "You can convert any currency to any currency"
    )
};

// Function to get the amount from the user
let userAmount = async (): Promise<number> => {
    let input: number;
    while (true) {
        let { amount } = await inquirer.prompt([{
            name: "amount",
            type: "number",
            message: chalk.yellowBright(`Enter Amount: `)
        }]);
        input = await amount;
        if (isNaN(input))
            console.log(`Enter amount in numbers ${input} is not a number.`);
        else
            break;
    }

    return input;
}

// Function to get the "from" currency
let fromCurrency = async (): Promise<objectKey> => {
    let { from } = await inquirer.prompt({
        name: "from",
        type: "list",
        choices: Object.keys(data),
        pageSize: 15,
        message: chalk.yellowBright("From Currency: "),

    })

    return from;
}

// Function to get the "to" currency
let toCurrency = async (): Promise<objectKey> => {
    let { to } = await inquirer.prompt({
        name: "to",
        type: "list",
        pageSize: 15,
        choices: Object.keys(data),
        message: chalk.yellowBright("To Currency: ")
    })

    return to;
}

// Function to perform the currency conversion calculation
let conversion = async (from: objectKey, to: objectKey, amount: number) => {
    return (data[to] / data[from] * amount).toFixed(3);


};

// Function to ask if the user wants to convert again
let convertAgain = async (): Promise<boolean> => {
    let { again } = await inquirer.prompt({
        name: "again",
        type: "confirm",
        message: "Do you want to exit? "
    });

    return again
};

// Main Program Logic
(async (): Promise<void> => {

    await ShowBanner();
    await wait(500);

    while (true) {
        let amount = await userAmount();
        let from = await fromCurrency();
        let to = await toCurrency();

        let conversionCurrency = await conversion(from, to, amount);

        let spinner = createSpinner("Converting...").start();
        await wait();
        spinner.success({ text: `${amount} ${from} = ${conversionCurrency} ${to}` });

        let value = await convertAgain();

        if (value) {
            console.log(`Hope you liked this currency converter app.`)
            break;
        };

    };

})();


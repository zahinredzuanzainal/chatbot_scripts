//import APIs
const { GoogleSpreadsheet } = require('google-spreadsheet');
let fs = require('fs');

let credsFile = Runtime.getAssets()['/creds.json'].path;
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));

//let credsFile = "C:/Users/Lenovo/Desktop/chatbot_projects/dodobot_1/dodobot-1/assets/creds.private.json"
//let creds = JSON.parse(fs.readFileSync(credsFile, {encoding:'utf8', flag:'r'}));



//Function 1: Convert messages into an array of values
function messageIntoArray(message){

    var trimmed_message_array = message.trim();
    trimmed_message_array = message.split(", ");

    //intialize array location
    let item_array = [];

    //split between dash
    for(i = 0; i < trimmed_message_array.length; i++){

        var per_item_info_array = trimmed_message_array[i].split("-");
        item_array.push(per_item_info_array);

    }

    //console.log(item_array);

    //Section 2
    //console.log(`Section 2 - F1`);

    //intialize new arrays (item_code_array, quantity_array)
    let item_code_array = [];
    let quantity_array = [];

    //sort item information into respective column arrays
    for (i=0; i < item_array.length; i++){
        //push item code into item_code_array
        item_code_array.push(item_array[i][[0]]);
        //push quantity into quantity_array
        quantity_array.push(item_array[i][1]);

    }

    //console.log(item_code_array);
    //console.log(quantity_array);

    //push item_code_array and quantity_array into a new array called column_array
    let column_array = [];
    column_array.push(item_code_array);
    column_array.push(quantity_array);

    return column_array;
}

//non-related function 1: Print Product Information
function printProductConsole(item_row){
    console.log(`\nItem Code: ${item_row.item_code}`);
    console.log(`Item Name: ${item_row.item_name}`);
    console.log(`--------------------------------`);
}

//filter_function
async function filterAndPushArray(item_code_array, rows_array){

    let filtered_rows_array = [];

    for (row_index=0; row_index < item_code_array.length; row_index++){

        const row = rows_array.filter(row => row.item_code === item_code_array[row_index])[0];
        filtered_rows_array.push(row);
    }

    let item_name_array = [];

    for (i=0; i < filtered_rows_array.length; i++){
        const item_name = filtered_rows_array[i].item_name;
        item_name_array.push(item_name);
    }

    
    return item_name_array;
}

//get item name
async function getItemNameArray(column_array){
//async function getItemNameArray(item_code_array){
//async function getItemNameArray(){

    //Section 1
    //console.log(`Section 1 - F2`);

    //get item_code_array
    const item_code_array = column_array[0];

    //Get Google Sheets File
    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();
    
    // get item_database sheet
    const productSheet = doc.sheetsByIndex[0];

    //show sheet title and number of rows
    //console.log(`Title: ${productSheet.title}, Number of Rows: ${productSheet.rowCount}, Number of Columns: ${productSheet.columnCount}`);

    // get rows in sheet
    const rows_array = await productSheet.getRows();

    //print all rows
    /*rows_array.forEach(row =>{
        printProductConsole(row);
    });*/

    //Section 2
    //console.log(`Section 2 - F2`);

    //Filter rows based on item_code_array to form filtered_row_array

    const item_name_array = await filterAndPushArray(item_code_array, rows_array);


    return item_name_array;
}

async function addDraftRow(name, draftSheet, item_name_array, item_code_array, quantity_array){

    //create new draft order row
    for (i=0; i < item_name_array.length; i++){

        const new_draft_order_row = {
            contact: name,
            item_name: item_name_array[i],
            item_code: item_code_array[i],
            quantity: quantity_array[i]
        }

        await draftSheet.addRow(new_draft_order_row);

    }

}

//consturct draft order
async function constructDraftOrder(message, name){

    //message to array
    const column_array = messageIntoArray(message);
    console.log(`\ncolumn_array:`);
    console.log(column_array);
    
    //get item name array
    const item_name_array = await getItemNameArray(column_array);
    console.log(`\nitem_name_array: `);
    console.log(item_name_array);

    //initialize string view
    var view_draft = ``;

    //item_code & quantity array
    var item_code_array = column_array[0];
    var quantity_array = column_array[1];

    //concantenate order
    for (i=0; i < item_name_array.length; i++){
        const order_string_template = `${item_name_array[i]} - ${quantity_array[i]}\n`
        //console.log(order_string_template);
        //console.log(quantity_array[i]);
        //console.log(item_name_array[i]);
        view_draft += order_string_template;
        //console.log(view_draft);
    }

    const doc = new GoogleSpreadsheet('1SU9nJTwnIC-Hd0JTR8-A9D6LSjNRQUdvP5qU5qPZszM');
    //Obtain file access with provided credentials by service account
    await doc.useServiceAccountAuth(creds);
    //Load all information (sheets, metadata) of the Google Sheets file
    await doc.loadInfo();
    
    // get item_database sheet
    const draftSheet = doc.sheetsByIndex[1];

    
    //create new draft order row or skip existing name
    await addDraftRow(name, draftSheet, item_name_array, item_code_array, quantity_array);

    //write in reply form
    return view_draft;
}

async function mainFunction(message, name){

        const view_draft = await constructDraftOrder(message, name);
        return view_draft;

}

/*async function tempFunc(message, name){
  
    const view_draft = await mainFunction(message, name);  

    const view_object = {order_list: view_draft};
  
    console.log(view_object);

}

const name = `Zahin`;
const message = `D003-3, D002-4`;

tempFunc(message, name);*/

exports.handler = async function (context, event, callback) {

    const message = event.Body;

    const name = event.From;
  
    const view_draft = await mainFunction(message, name);  

    const view_object = {order_list: view_draft};
  
    return callback(null, view_object);
  };

/*async function tempMessageView(message, name){

    const order_msg = message;
    const msg_outcome = await mainFunction(order_msg, name);
    console.log(msg_outcome);


}

//sample message and name
const name = `Zahin`;
const message = `D003-3, D002-4`;


tempMessageView(message, name);*/